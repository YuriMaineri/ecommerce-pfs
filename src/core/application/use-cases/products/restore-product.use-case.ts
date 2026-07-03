import { Inject, Injectable } from '@nestjs/common';
import { Product } from '../../../domain/entities/product.entity';
import { PRODUCT_REPOSITORY } from '../../../domain/repositories/injection-tokens';
import { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { CACHE_SERVICE } from '../../injection-tokens';
import { ICacheService } from '../../ports/cache.port';
import { PRODUCTS_LIST_CACHE_PREFIX } from './list-products.use-case';

@Injectable()
export class RestoreProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: IProductRepository,
    @Inject(CACHE_SERVICE) private readonly cache: ICacheService,
  ) {}

  async execute(id: string): Promise<Product> {
    const restored = await this.products.restore(id);
    await this.cache.delByPrefix(PRODUCTS_LIST_CACHE_PREFIX);
    return restored;
  }
}
