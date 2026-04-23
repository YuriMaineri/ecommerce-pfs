import { Inject, Injectable } from '@nestjs/common';
import { Order } from '../../../domain/entities/order.entity';
import { ForbiddenAccessError } from '../../../domain/errors/application.errors';
import { InvalidOrderStateError } from '../../../domain/errors/application.errors';
import { ResourceNotFoundError } from '../../../domain/errors/application.errors';
import { OrderStatus } from '../../../domain/enums/order-status.enum';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { ORDER_REPOSITORY } from '../../../domain/repositories/injection-tokens';
import { IOrderRepository } from '../../../domain/repositories/order.repository.interface';

export interface UpdateOrderStatusInput {
  orderId: string;
  status: OrderStatus;
  actorUserId: string;
  actorRole: UserRole;
}

@Injectable()
export class UpdateOrderStatusUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orders: IOrderRepository,
  ) {}

  async execute(input: UpdateOrderStatusInput): Promise<Order> {
    const order = await this.orders.findByIdWithItems(input.orderId);
    if (!order) {
      throw new ResourceNotFoundError('Order', input.orderId);
    }
    if (input.actorRole !== UserRole.ADMIN) {
      order.assertOwnedBy(input.actorUserId);
      if (input.status !== OrderStatus.CANCELLED) {
        throw new ForbiddenAccessError('Customers may only cancel orders');
      }
      if (order.status !== OrderStatus.CREATED) {
        throw new InvalidOrderStateError(
          'Customers may only cancel orders in CREATED status',
        );
      }
      await this.orders.cancelOrderAndRestoreStock(
        input.orderId,
        input.actorUserId,
        false,
      );
      return (await this.orders.findByIdWithItems(input.orderId)) as Order;
    }
    if (input.status === OrderStatus.CANCELLED) {
      await this.orders.cancelOrderAndRestoreStock(
        input.orderId,
        input.actorUserId,
        true,
      );
      return (await this.orders.findByIdWithItems(input.orderId)) as Order;
    }
    if (order.status === OrderStatus.CANCELLED) {
      throw new InvalidOrderStateError(
        'Cannot change status of a cancelled order',
      );
    }
    return this.orders.updateStatus(input.orderId, input.status);
  }
}
