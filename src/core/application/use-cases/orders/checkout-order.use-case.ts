import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Order } from '../../../domain/entities/order.entity';
import { Payment } from '../../../domain/entities/payment.entity';
import { PAYMENT_REPOSITORY } from '../../../domain/repositories/injection-tokens';
import { IPaymentRepository } from '../../../domain/repositories/payment.repository.interface';

export interface CheckoutOrderResult {
  order: Order;
  payment: Payment;
}

@Injectable()
export class CheckoutOrderUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY) private readonly payments: IPaymentRepository,
  ) {}

  async execute(orderId: string, userId: string): Promise<CheckoutOrderResult> {
    const reference = randomUUID();
    return this.payments.checkout(orderId, userId, reference);
  }
}
