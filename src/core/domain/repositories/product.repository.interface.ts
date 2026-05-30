import { Product } from '../entities/product.entity';

export type ProductSortBy = 'createdAt' | 'price' | 'name';
export type SortOrder = 'asc' | 'desc';

export interface ProductFilters {
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  /** Quando definido, filtra por produtos ativos/inativos. */
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
  /** Lista paginada e filtrada (ignora excluidos logicamente). */
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
  /** Lista apenas os registros excluidos logicamente. */
  findDeleted(): Promise<Product[]>;
  /** Restaura um registro excluido logicamente (deletedAt -> null). */
  restore(id: string): Promise<Product>;
}
