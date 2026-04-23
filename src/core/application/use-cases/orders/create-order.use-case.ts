import { Inject, Injectable } from '@nestjs/common';
import { Order } from '../../../domain/entities/order.entity';
import { ORDER_REPOSITORY } from '../../../domain/repositories/injection-tokens';
import { IOrderRepository } from '../../../domain/repositories/order.repository.interface';

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orders: IOrderRepository,
  ) {}

  async execute(userId: string): Promise<Order> {
    return this.orders.createEmptyOrder(userId);
  }
}
