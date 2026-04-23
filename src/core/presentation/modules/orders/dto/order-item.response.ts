import { ApiProperty } from '@nestjs/swagger';
import { OrderItem } from '../../../../domain/entities/order-item.entity';

export class OrderItemResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  orderId!: string;

  @ApiProperty()
  productId!: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  unitPrice!: number;

  @ApiProperty()
  subtotal!: number;

  static fromDomain(i: OrderItem): OrderItemResponse {
    const dto = new OrderItemResponse();
    dto.id = i.id;
    dto.orderId = i.orderId;
    dto.productId = i.productId;
    dto.quantity = i.quantity;
    dto.unitPrice = i.unitPrice;
    dto.subtotal = i.subtotal;
    return dto;
  }
}
