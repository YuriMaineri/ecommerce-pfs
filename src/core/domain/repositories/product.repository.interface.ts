import { Product } from '../entities/product.entity';

export interface IProductRepository {
  create(product: Product): Promise<Product>;
  findById(id: string): Promise<Product | null>;
  findAll(params?: {
    categoryId?: string;
    skip?: number;
    take?: number;
  }): Promise<Product[]>;
  update(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      image: string;
      thumbnail: string;
      stock: number;
      price: number;
      active: boolean;
      categoryId: string;
    }>,
  ): Promise<Product>;
  delete(id: string): Promise<void>;
  countOrderItemReferences(productId: string): Promise<number>;
}
