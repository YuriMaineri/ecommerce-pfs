import { Inject, Injectable } from '@nestjs/common';
import { Order } from '../../../domain/entities/order.entity';
import { ForbiddenAccessError } from '../../../domain/errors/application.errors';
import { ResourceNotFoundError } from '../../../domain/errors/application.errors';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { ORDER_REPOSITORY } from '../../../domain/repositories/injection-tokens';
import { IOrderRepository } from '../../../domain/repositories/order.repository.interface';

@Injectable()
export class GetOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orders: IOrderRepository,
  ) {}

  async execute(
    orderId: string,
    actorUserId: string,
    actorRole: UserRole,
  ): Promise<Order> {
    const order = await this.orders.findByIdWithItems(orderId);
    if (!order) {
      throw new ResourceNotFoundError('Order', orderId);
    }
    if (actorRole !== UserRole.ADMIN) {
      try {
        order.assertOwnedBy(actorUserId);
      } catch {
        throw new ForbiddenAccessError();
      }
    }
    return order;
  }
}
