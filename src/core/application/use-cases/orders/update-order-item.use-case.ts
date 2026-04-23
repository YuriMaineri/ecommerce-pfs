import { Inject, Injectable } from '@nestjs/common';
import { Order } from '../../../domain/entities/order.entity';
import { ORDER_REPOSITORY } from '../../../domain/repositories/injection-tokens';
import { IOrderRepository } from '../../../domain/repositories/order.repository.interface';

export interface UpdateOrderItemInput {
  orderId: string;
  userId: string;
  itemId: string;
  quantity: number;
}

@Injectable()
export class UpdateOrderItemUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orders: IOrderRepository,
  ) {}

  async execute(input: UpdateOrderItemInput): Promise<Order> {
    return this.orders.updateLineItemQuantity({
      orderId: input.orderId,
      userId: input.userId,
      itemId: input.itemId,
      quantity: input.quantity,
    });
  }
}
