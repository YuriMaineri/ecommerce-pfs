import { Injectable } from '@nestjs/common';
import {
  OrderStatus as PrismaOrderStatus,
  PaymentStatus as PrismaPaymentStatus,
} from '@prisma/client';
import { Payment } from '../../../domain/entities/payment.entity';
import {
  ForbiddenAccessError,
  InvalidOrderStateError,
  ResourceNotFoundError,
} from '../../../domain/errors/application.errors';
import {
  CheckoutResult,
  IPaymentRepository,
  WebhookResult,
} from '../../../domain/repositories/payment.repository.interface';
import { OrderMapper } from '../mappers/order.mapper';
import { PaymentMapper } from '../mappers/payment.mapper';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaPaymentRepository implements IPaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async checkout(
    orderId: string,
    userId: string,
    reference: string,
  ): Promise<CheckoutResult> {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });
      if (!order) {
        throw new ResourceNotFoundError('Order', orderId);
      }
      if (order.userId !== userId) {
        throw new ForbiddenAccessError();
      }
      if (order.status !== PrismaOrderStatus.CREATED) {
        throw new InvalidOrderStateError(
          'Only orders in CREATED status can be sent to payment',
        );
      }
      if (order.items.length === 0) {
        throw new InvalidOrderStateError(
          'Cannot checkout an order without items',
        );
      }

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: PrismaOrderStatus.AWAITING_PAYMENT },
        include: { items: true },
      });

      const payment = await tx.payment.create({
        data: {
          orderId,
          status: PrismaPaymentStatus.PENDING,
          amount: order.totalAmount,
          provider: 'mock',
          reference,
        },
      });

      return {
        order: OrderMapper.toDomain(updatedOrder),
        payment: PaymentMapper.toDomain(payment),
      };
    });
  }

  async findByReference(reference: string): Promise<Payment | null> {
    const row = await this.prisma.payment.findUnique({ where: { reference } });
    return row ? PaymentMapper.toDomain(row) : null;
  }

  async applyWebhookResult(
    reference: string,
    approved: boolean,
  ): Promise<WebhookResult> {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { reference },
        include: { order: { include: { items: true } } },
      });
      if (!payment) {
        throw new ResourceNotFoundError('Payment', reference);
      }

      if (payment.status !== PrismaPaymentStatus.PENDING) {
        return {
          order: OrderMapper.toDomain(payment.order),
          payment: PaymentMapper.toDomain(payment),
          alreadyProcessed: true,
        };
      }

      const newPaymentStatus = approved
        ? PrismaPaymentStatus.APPROVED
        : PrismaPaymentStatus.DECLINED;

      const newOrderStatus = approved
        ? PrismaOrderStatus.PAID
        : PrismaOrderStatus.CREATED;

      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: { status: newPaymentStatus, processedAt: new Date() },
      });

      const updatedOrder = await tx.order.update({
        where: { id: payment.orderId },
        data: { status: newOrderStatus },
        include: { items: true },
      });

      return {
        order: OrderMapper.toDomain(updatedOrder),
        payment: PaymentMapper.toDomain(updatedPayment),
        alreadyProcessed: false,
      };
    });
  }
}
