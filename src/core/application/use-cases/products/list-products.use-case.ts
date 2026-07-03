import { Inject, Injectable } from '@nestjs/common';
import { Product } from '../../../domain/entities/product.entity';
import { PRODUCT_REPOSITORY } from '../../../domain/repositories/injection-tokens';
import {
  IProductRepository,
  ProductSortBy,
  SortOrder,
} from '../../../domain/repositories/product.repository.interface';
import { CACHE_SERVICE } from '../../injection-tokens';
import { ICacheService } from '../../ports/cache.port';

export const PRODUCTS_LIST_CACHE_PREFIX = 'products:list:';
const PRODUCTS_LIST_CACHE_TTL = 60;

export interface ListProductsQuery {
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  active?: boolean;
  sortBy?: ProductSortBy;
  order?: SortOrder;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 100;

@Injectable()
export class ListProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: IProductRepository,
    @Inject(CACHE_SERVICE) private readonly cache: ICacheService,
  ) {}

  async execute(
    query: ListProductsQuery = {},
  ): Promise<PaginatedResult<Product>> {
    const page = query.page && query.page > 0 ? query.page : DEFAULT_PAGE;
    const pageSize = Math.min(
      query.pageSize && query.pageSize > 0 ? query.pageSize : DEFAULT_PAGE_SIZE,
      MAX_PAGE_SIZE,
    );

    const filters = {
      categoryId: query.categoryId,
      search: query.search,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      active: query.active,
      sortBy: query.sortBy,
      order: query.order,
      page,
      pageSize,
    };

    const cacheKey = PRODUCTS_LIST_CACHE_PREFIX + JSON.stringify(filters);
    const cached = await this.cache.get<PaginatedResult<Product>>(cacheKey);
    if (cached) {
      return cached;
    }

    const { items, total } = await this.products.findPaginated(filters);
    const result: PaginatedResult<Product> = {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };

    await this.cache.set(cacheKey, result, PRODUCTS_LIST_CACHE_TTL);
    return result;
  }
}
