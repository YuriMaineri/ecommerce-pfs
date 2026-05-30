import { Payment as PrismaPayment } from '@prisma/client';
import { Payment } from '../../../domain/entities/payment.entity';
import { PaymentStatus } from '../../../domain/enums/payment-status.enum';
import { decimalToNumber } from './decimal.util';

export class PaymentMapper {
  static toDomain(row: PrismaPayment): Payment {
    return new Payment(
      row.id,
      row.orderId,
      row.status as PaymentStatus,
      decimalToNumber(row.amount),
      row.provider,
      row.reference,
      row.createdAt,
      row.processedAt ?? null,
    );
  }
}
