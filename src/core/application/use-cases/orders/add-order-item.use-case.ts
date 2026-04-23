import { Inject, Injectable } from '@nestjs/common';
import { Order } from '../../../domain/entities/order.entity';
import { ORDER_REPOSITORY } from '../../../domain/repositories/injection-tokens';
import { IOrderRepository } from '../../../domain/repositories/order.repository.interface';

export interface AddOrderItemInput {
  orderId: string;
  userId: string;
  productId: string;
  quantity: number;
}

@Injectable()
export class AddOrderItemUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orders: IOrderRepository,
  ) {}

  async execute(input: AddOrderItemInput): Promise<Order> {
    return this.orders.addOrUpdateLineItem({
      orderId: input.orderId,
      userId: input.userId,
      productId: input.productId,
      quantity: input.quantity,
    });
  }
}
