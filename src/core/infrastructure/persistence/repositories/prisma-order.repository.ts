import { Injectable } from '@nestjs/common';
import { OrderStatus as PrismaOrderStatus, Prisma } from '@prisma/client';
import { Order } from '../../../domain/entities/order.entity';
import { OrderStatus } from '../../../domain/enums/order-status.enum';
import {
  ForbiddenAccessError,
  InsufficientStockError,
  InvalidOrderStateError,
  ProductInactiveError,
  ResourceNotFoundError,
} from '../../../domain/errors/application.errors';
import {
  AddOrUpdateLineInput,
  IOrderRepository,
  RemoveLineInput,
  UpdateLineQuantityInput,
} from '../../../domain/repositories/order.repository.interface';
import { OrderMapper } from '../mappers/order.mapper';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaOrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createEmptyOrder(userId: string): Promise<Order> {
    const created = await this.prisma.order.create({
      data: {
        userId,
        status: PrismaOrderStatus.CREATED,
        totalAmount: new Prisma.Decimal(0),
        items: { create: [] },
      },
      include: { items: true },
    });
    return OrderMapper.toDomain(created);
  }

  async findByIdWithItems(id: string): Promise<Order | null> {
    const row = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    return row ? OrderMapper.toDomain(row) : null;
  }

  async findByIdWithItemsForUser(
    id: string,
    userId: string,
  ): Promise<Order | null> {
    const row = await this.prisma.order.findFirst({
      where: { id, userId },
      include: { items: true },
    });
    return row ? OrderMapper.toDomain(row) : null;
  }

  async findAllByUser(userId: string): Promise<Order[]> {
    const rows = await this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(OrderMapper.toDomain);
  }

  async findAll(): Promise<Order[]> {
    const rows = await this.prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(OrderMapper.toDomain);
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: status as PrismaOrderStatus },
      include: { items: true },
    });
    return OrderMapper.toDomain(updated);
  }

  async deleteOrderIfCreated(
    orderId: string,
    actorUserId: string,
    actorIsAdmin: boolean,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });
      if (!order) {
        throw new ResourceNotFoundError('Order', orderId);
      }
      if (!actorIsAdmin && order.userId !== actorUserId) {
        throw new ForbiddenAccessError();
      }
      if (order.status !== PrismaOrderStatus.CREATED) {
        throw new InvalidOrderStateError(
          'Only orders in CREATED status can be deleted',
        );
      }
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
      await tx.order.delete({ where: { id: orderId } });
    });
  }

  async cancelOrderAndRestoreStock(
    orderId: string,
    actorUserId: string,
    actorIsAdmin: boolean,
  ): Promise<Order> {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });
      if (!order) {
        throw new ResourceNotFoundError('Order', orderId);
      }
      if (!actorIsAdmin && order.userId !== actorUserId) {
        throw new ForbiddenAccessError();
      }
      if (order.status === PrismaOrderStatus.CANCELLED) {
        throw new InvalidOrderStateError('Order is already cancelled');
      }
      if (!actorIsAdmin && order.status !== PrismaOrderStatus.CREATED) {
        throw new InvalidOrderStateError(
          'Order cannot be cancelled in its current state',
        );
      }
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status: PrismaOrderStatus.CANCELLED },
        include: { items: true },
      });
      return OrderMapper.toDomain(updated);
    });
  }

  async addOrUpdateLineItem(input: AddOrUpdateLineInput): Promise<Order> {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: input.orderId },
        include: { items: true },
      });
      if (!order) {
        throw new ResourceNotFoundError('Order', input.orderId);
      }
      if (order.userId !== input.userId) {
        throw new ForbiddenAccessError();
      }
      if (order.status !== PrismaOrderStatus.CREATED) {
        throw new InvalidOrderStateError(
          'Items can only be changed while order is CREATED',
        );
      }
      if (input.quantity < 1) {
        throw new InvalidOrderStateError(
          'Order item quantity must be at least 1',
        );
      }

      const product = await tx.product.findUnique({
        where: { id: input.productId },
      });
      if (!product) {
        throw new ResourceNotFoundError('Product', input.productId);
      }
      if (!product.active) {
        throw new ProductInactiveError();
      }

      const existing = order.items.find((i) => i.productId === input.productId);
      const oldQty = existing?.quantity ?? 0;
      const newQty = oldQty + input.quantity;
      const delta = newQty - oldQty;
      if (product.stock < delta) {
        throw new InsufficientStockError(product.stock, delta);
      }

      await tx.product.update({
        where: { id: product.id },
        data: { stock: { decrement: delta } },
      });

      const unitPrice = existing?.unitPrice ?? product.price;
      const subtotal = new Prisma.Decimal(newQty).mul(unitPrice);

      if (existing) {
        await tx.orderItem.update({
          where: { id: existing.id },
          data: {
            quantity: newQty,
            unitPrice,
            subtotal,
          },
        });
      } else {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: product.id,
            quantity: newQty,
            unitPrice: product.price,
            subtotal: new Prisma.Decimal(newQty).mul(product.price),
          },
        });
      }

      const items = await tx.orderItem.findMany({
        where: { orderId: order.id },
      });
      const total = items.reduce(
        (sum, i) => sum.plus(i.subtotal),
        new Prisma.Decimal(0),
      );
      const updated = await tx.order.update({
        where: { id: order.id },
        data: { totalAmount: total },
        include: { items: true },
      });
      return OrderMapper.toDomain(updated);
    });
  }

  async updateLineItemQuantity(input: UpdateLineQuantityInput): Promise<Order> {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: input.orderId },
        include: { items: true },
      });
      if (!order) {
        throw new ResourceNotFoundError('Order', input.orderId);
      }
      if (order.userId !== input.userId) {
        throw new ForbiddenAccessError();
      }
      if (order.status !== PrismaOrderStatus.CREATED) {
        throw new InvalidOrderStateError(
          'Items can only be changed while order is CREATED',
        );
      }
      if (input.quantity < 1) {
        throw new InvalidOrderStateError(
          'Order item quantity must be at least 1',
        );
      }

      const item = order.items.find((i) => i.id === input.itemId);
      if (!item) {
        throw new ResourceNotFoundError('OrderItem', input.itemId);
      }

      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) {
        throw new ResourceNotFoundError('Product', item.productId);
      }

      const delta = input.quantity - item.quantity;
      if (delta > 0 && product.stock < delta) {
        throw new InsufficientStockError(product.stock, delta);
      }

      await tx.product.update({
        where: { id: product.id },
        data: { stock: { decrement: delta } },
      });

      const subtotal = new Prisma.Decimal(input.quantity).mul(item.unitPrice);
      await tx.orderItem.update({
        where: { id: item.id },
        data: {
          quantity: input.quantity,
          subtotal,
        },
      });

      const items = await tx.orderItem.findMany({
        where: { orderId: order.id },
      });
      const total = items.reduce(
        (sum, i) => sum.plus(i.subtotal),
        new Prisma.Decimal(0),
      );
      const updated = await tx.order.update({
        where: { id: order.id },
        data: { totalAmount: total },
        include: { items: true },
      });
      return OrderMapper.toDomain(updated);
    });
  }

  async removeLineItem(input: RemoveLineInput): Promise<Order> {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: input.orderId },
        include: { items: true },
      });
      if (!order) {
        throw new ResourceNotFoundError('Order', input.orderId);
      }
      if (order.userId !== input.userId) {
        throw new ForbiddenAccessError();
      }
      if (order.status !== PrismaOrderStatus.CREATED) {
        throw new InvalidOrderStateError(
          'Items can only be changed while order is CREATED',
        );
      }

      const item = order.items.find((i) => i.id === input.itemId);
      if (!item) {
        throw new ResourceNotFoundError('OrderItem', input.itemId);
      }

      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
      await tx.orderItem.delete({ where: { id: item.id } });

      const items = await tx.orderItem.findMany({
        where: { orderId: order.id },
      });
      const total = items.length
        ? items.reduce((sum, i) => sum.plus(i.subtotal), new Prisma.Decimal(0))
        : new Prisma.Decimal(0);
      const updated = await tx.order.update({
        where: { id: order.id },
        data: { totalAmount: total },
        include: { items: true },
      });
      return OrderMapper.toDomain(updated);
    });
  }
}
