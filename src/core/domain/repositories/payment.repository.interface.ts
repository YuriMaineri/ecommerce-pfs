import { Order } from '../entities/order.entity';
import { Payment } from '../entities/payment.entity';

export interface CheckoutResult {
  order: Order;
  payment: Payment;
}

export interface WebhookResult {
  order: Order;
  payment: Payment;
  /** true quando o pagamento ja havia sido processado (chamada idempotente). */
  alreadyProcessed: boolean;
}

export interface IPaymentRepository {
  /**
   * Inicia o checkout de um pedido: valida posse/estado, move o pedido para
   * AWAITING_PAYMENT e cria um Payment PENDING. Transacional.
   */
  checkout(
    orderId: string,
    userId: string,
    reference: string,
  ): Promise<CheckoutResult>;

  findByReference(reference: string): Promise<Payment | null>;

  /**
   * Aplica o resultado do gateway (via webhook) de forma idempotente.
   * approved=true -> Payment APPROVED + pedido PAID.
   * approved=false -> Payment DECLINED + pedido volta para CREATED.
   */
  applyWebhookResult(reference: string, approved: boolean): Promise<WebhookResult>;
}
