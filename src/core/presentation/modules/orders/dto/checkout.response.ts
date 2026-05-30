import { ApiProperty } from '@nestjs/swagger';
import { Order } from '../../../../domain/entities/order.entity';
import { Payment } from '../../../../domain/entities/payment.entity';
import { OrderStatus } from '../../../../domain/enums/order-status.enum';

export class CheckoutResponse {
  @ApiProperty()
  orderId!: string;

  @ApiProperty({ description: 'Referencia do pagamento usada pelo gateway/webhook' })
  reference!: string;

  @ApiProperty()
  amount!: number;

  @ApiProperty({ enum: OrderStatus })
  orderStatus!: OrderStatus;

  static from(order: Order, payment: Payment): CheckoutResponse {
    const dto = new CheckoutResponse();
    dto.orderId = order.id;
    dto.reference = payment.reference;
    dto.amount = payment.amount;
    dto.orderStatus = order.status;
    return dto;
  }
}
