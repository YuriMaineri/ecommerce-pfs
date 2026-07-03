import { Inject, Injectable } from '@nestjs/common';
import { ResourceNotFoundError } from '../../../domain/errors/application.errors';
import { PRODUCT_REPOSITORY } from '../../../domain/repositories/injection-tokens';
import { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { CACHE_SERVICE } from '../../injection-tokens';
import { ICacheService } from '../../ports/cache.port';
import { PRODUCTS_LIST_CACHE_PREFIX } from './list-products.use-case';

@Injectable()
export class DeleteProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: IProductRepository,
    @Inject(CACHE_SERVICE) private readonly cache: ICacheService,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.products.findById(id);
    if (!existing) {
      throw new ResourceNotFoundError('Product', id);
    }

    await this.products.delete(id);
    await this.cache.delByPrefix(PRODUCTS_LIST_CACHE_PREFIX);
  }
}
