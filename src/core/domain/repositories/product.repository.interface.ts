import { Product } from '../entities/product.entity';

export type ProductSortBy = 'createdAt' | 'price' | 'name';
export type SortOrder = 'asc' | 'desc';

export interface ProductFilters {
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;

  active?: boolean;
  sortBy?: ProductSortBy;
  order?: SortOrder;
  page: number;
  pageSize: number;
}

export interface PaginatedProducts {
  items: Product[];
  total: number;
}

export interface IProductRepository {
  create(product: Product): Promise<Product>;
  findById(id: string): Promise<Product | null>;
  findAll(params?: {
    categoryId?: string;
    skip?: number;
    take?: number;
  }): Promise<Product[]>;

  findPaginated(filters: ProductFilters): Promise<PaginatedProducts>;
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

  findDeleted(): Promise<Product[]>;

  restore(id: string): Promise<Product>;
}
