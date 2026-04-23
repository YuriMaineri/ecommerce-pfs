import { ApiProperty } from '@nestjs/swagger';
import { Order } from '../../../../domain/entities/order.entity';
import { OrderStatus } from '../../../../domain/enums/order-status.enum';
import { OrderItemResponse } from './order-item.response';

export class OrderResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty({ enum: OrderStatus })
  status!: OrderStatus;

  @ApiProperty()
  totalAmount!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty({ type: [OrderItemResponse] })
  items!: OrderItemResponse[];

  static fromDomain(o: Order): OrderResponse {
    const dto = new OrderResponse();
    dto.id = o.id;
    dto.userId = o.userId;
    dto.status = o.status;
    dto.totalAmount = o.totalAmount;
    dto.createdAt = o.createdAt;
    dto.items = o.items.map(OrderItemResponse.fromDomain);
    return dto;
  }
}
