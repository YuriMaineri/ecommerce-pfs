import {
  BusinessRuleViolationError,
  InsufficientStockError,
  ProductInactiveError,
} from '../errors/application.errors';
import { Category } from './category.entity';

export class Product {
  constructor(
    public readonly id: string,
    public name: string,
    public description: string,
    public image: string,
    public thumbnail: string,
    public stock: number,
    public price: number,
    public active: boolean,
    public readonly createdAt: Date,
    public categoryId: string,
    public readonly category?: Category,
  ) {}

  assertNonNegativeStock(): void {
    if (this.stock < 0) {
      throw new BusinessRuleViolationError('Product stock cannot be negative');
    }
  }

  assertPositivePrice(): void {
    if (this.price <= 0) {
      throw new BusinessRuleViolationError(
        'Product price must be greater than zero',
      );
    }
  }

  assertActiveForOrder(): void {
    if (!this.active) {
      throw new ProductInactiveError();
    }
  }

  assertAvailableQuantity(requested: number): void {
    if (requested < 1) {
      throw new BusinessRuleViolationError(
        'Order item quantity must be at least 1',
      );
    }
    if (this.stock < requested) {
      throw new InsufficientStockError(this.stock, requested);
    }
  }
}
