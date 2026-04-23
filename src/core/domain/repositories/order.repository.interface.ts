import { Order } from '../entities/order.entity';
import { OrderStatus } from '../enums/order-status.enum';

export interface AddOrUpdateLineInput {
  orderId: string;
  userId: string;
  productId: string;
  quantity: number;
}

export interface UpdateLineQuantityInput {
  orderId: string;
  userId: string;
  itemId: string;
  quantity: number;
}

export interface RemoveLineInput {
  orderId: string;
  userId: string;
  itemId: string;
}

export interface IOrderRepository {
  createEmptyOrder(userId: string): Promise<Order>;
  findByIdWithItems(id: string): Promise<Order | null>;
  findByIdWithItemsForUser(id: string, userId: string): Promise<Order | null>;
  findAllByUser(userId: string): Promise<Order[]>;
  findAll(): Promise<Order[]>;
  updateStatus(orderId: string, status: OrderStatus): Promise<Order>;
  deleteOrderIfCreated(
    orderId: string,
    userId: string,
    actorIsAdmin: boolean,
  ): Promise<void>;
  cancelOrderAndRestoreStock(
    orderId: string,
    userId: string,
    actorIsAdmin: boolean,
  ): Promise<Order>;
  addOrUpdateLineItem(input: AddOrUpdateLineInput): Promise<Order>;
  updateLineItemQuantity(input: UpdateLineQuantityInput): Promise<Order>;
  removeLineItem(input: RemoveLineInput): Promise<Order>;
}
