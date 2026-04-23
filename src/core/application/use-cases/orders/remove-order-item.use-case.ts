import { Inject, Injectable } from '@nestjs/common';
import { Order } from '../../../domain/entities/order.entity';
import { ORDER_REPOSITORY } from '../../../domain/repositories/injection-tokens';
import { IOrderRepository } from '../../../domain/repositories/order.repository.interface';

export interface RemoveOrderItemInput {
  orderId: string;
  userId: string;
  itemId: string;
}

@Injectable()
export class RemoveOrderItemUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orders: IOrderRepository,
  ) {}

  async execute(input: RemoveOrderItemInput): Promise<Order> {
    return this.orders.removeLineItem({
      orderId: input.orderId,
      userId: input.userId,
      itemId: input.itemId,
    });
  }
}
