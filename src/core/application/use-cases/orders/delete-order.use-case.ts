import { Inject, Injectable } from '@nestjs/common';
import { ResourceNotFoundError } from '../../../domain/errors/application.errors';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { ORDER_REPOSITORY } from '../../../domain/repositories/injection-tokens';
import { IOrderRepository } from '../../../domain/repositories/order.repository.interface';

@Injectable()
export class DeleteOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orders: IOrderRepository,
  ) {}

  async execute(
    orderId: string,
    actorUserId: string,
    actorRole: UserRole,
  ): Promise<void> {
    const order = await this.orders.findByIdWithItems(orderId);
    if (!order) {
      throw new ResourceNotFoundError('Order', orderId);
    }
    await this.orders.deleteOrderIfCreated(
      orderId,
      actorUserId,
      actorRole === UserRole.ADMIN,
    );
  }
}
