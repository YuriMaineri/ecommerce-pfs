import { Inject, Injectable } from '@nestjs/common';
import { Product } from '../../../domain/entities/product.entity';
import { PRODUCT_REPOSITORY } from '../../../domain/repositories/injection-tokens';
import { IProductRepository } from '../../../domain/repositories/product.repository.interface';

export interface ListProductsQuery {
  categoryId?: string;
  skip?: number;
  take?: number;
}

@Injectable()
export class ListProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: IProductRepository,
  ) {}

  async execute(query: ListProductsQuery = {}): Promise<Product[]> {
    return this.products.findAll({
      categoryId: query.categoryId,
      skip: query.skip,
      take: query.take,
    });
  }
}
