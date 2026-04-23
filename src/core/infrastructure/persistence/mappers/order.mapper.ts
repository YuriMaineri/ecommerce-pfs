import {
  Order as PrismaOrder,
  OrderItem as PrismaOrderItem,
} from '@prisma/client';
import { Order } from '../../../domain/entities/order.entity';
import { OrderItem } from '../../../domain/entities/order-item.entity';
import { OrderStatus } from '../../../domain/enums/order-status.enum';
import { decimalToNumber } from './decimal.util';

type OrderWithItems = PrismaOrder & { items: PrismaOrderItem[] };

export class OrderMapper {
  static toDomain(row: OrderWithItems): Order {
    const items = row.items.map(
      (i) =>
        new OrderItem(
          i.id,
          i.orderId,
          i.productId,
          i.quantity,
          decimalToNumber(i.unitPrice),
          decimalToNumber(i.subtotal),
        ),
    );
    return new Order(
      row.id,
      row.userId,
      row.status as OrderStatus,
      decimalToNumber(row.totalAmount),
      row.createdAt,
      items,
    );
  }
}
