import { Inject, Injectable } from '@nestjs/common';
import { Order } from '../../../domain/entities/order.entity';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { ORDER_REPOSITORY } from '../../../domain/repositories/injection-tokens';
import { IOrderRepository } from '../../../domain/repositories/order.repository.interface';

@Injectable()
export class ListOrdersUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orders: IOrderRepository,
  ) {}

  async execute(userId: string, role: UserRole): Promise<Order[]> {
    if (role === UserRole.ADMIN) {
      return this.orders.findAll();
    }
    return this.orders.findAllByUser(userId);
  }
}
