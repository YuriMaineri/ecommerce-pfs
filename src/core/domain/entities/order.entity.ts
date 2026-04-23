import { OrderStatus } from '../enums/order-status.enum';
import { ForbiddenAccessError } from '../errors/application.errors';
import { InvalidOrderStateError } from '../errors/application.errors';
import { OrderItem } from './order-item.entity';

export class Order {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public status: OrderStatus,
    public totalAmount: number,
    public readonly createdAt: Date,
    public items: OrderItem[],
  ) {}

  assertOwnedBy(userId: string): void {
    if (this.userId !== userId) {
      throw new ForbiddenAccessError('This order belongs to another user');
    }
  }

  assertEditable(): void {
    if (this.status !== OrderStatus.CREATED) {
      throw new InvalidOrderStateError(
        'Order can only be modified while in CREATED status',
      );
    }
  }

  recalculateTotal(): void {
    this.totalAmount = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  }
}
