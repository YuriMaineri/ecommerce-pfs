import { Order } from '../entities/order.entity';
import { Payment } from '../entities/payment.entity';

export interface CheckoutResult {
  order: Order;
  payment: Payment;
}

export interface WebhookResult {
  order: Order;
  payment: Payment;

  alreadyProcessed: boolean;
}

export interface IPaymentRepository {

  checkout(
    orderId: string,
    userId: string,
    reference: string,
  ): Promise<CheckoutResult>;

  findByReference(reference: string): Promise<Payment | null>;

  applyWebhookResult(reference: string, approved: boolean): Promise<WebhookResult>;
}
