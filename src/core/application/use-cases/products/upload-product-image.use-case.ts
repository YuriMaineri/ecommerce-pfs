import { Inject, Injectable } from '@nestjs/common';
import { Product } from '../../../domain/entities/product.entity';
import { ResourceNotFoundError } from '../../../domain/errors/application.errors';
import { InvalidFileUploadError } from '../../../domain/errors/application.errors';
import { CACHE_SERVICE, FILE_STORAGE } from '../../injection-tokens';
import { PRODUCT_REPOSITORY } from '../../../domain/repositories/injection-tokens';
import { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { ICacheService } from '../../ports/cache.port';
import {
  IFileStoragePort,
  UploadedFilePayload,
} from '../../ports/file-storage.port';
import { PRODUCTS_LIST_CACHE_PREFIX } from './list-products.use-case';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/jpg']);

@Injectable()
export class UploadProductImageUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: IProductRepository,
    @Inject(FILE_STORAGE) private readonly storage: IFileStoragePort,
    @Inject(CACHE_SERVICE) private readonly cache: ICacheService,
  ) {}

  async execute(
    productId: string,
    file: UploadedFilePayload,
  ): Promise<Product> {
    const existing = await this.products.findById(productId);
    if (!existing) {
      throw new ResourceNotFoundError('Product', productId);
    }
    const mime = file.mimetype.toLowerCase();
    if (!ALLOWED.has(mime)) {
      throw new InvalidFileUploadError(
        'Only JPEG, PNG, and WebP images are allowed',
      );
    }
    const path = await this.storage.saveProductImage(productId, file);
    const updated = await this.products.update(productId, { image: path });
    await this.cache.delByPrefix(PRODUCTS_LIST_CACHE_PREFIX);
    return updated;
  }
}
