import { Inject, Injectable } from '@nestjs/common';
import { Product } from '../../../domain/entities/product.entity';
import { ResourceNotFoundError } from '../../../domain/errors/application.errors';
import { InvalidFileUploadError } from '../../../domain/errors/application.errors';
import { FILE_STORAGE } from '../../injection-tokens';
import { PRODUCT_REPOSITORY } from '../../../domain/repositories/injection-tokens';
import { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import {
  IFileStoragePort,
  UploadedFilePayload,
} from '../../ports/file-storage.port';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/jpg']);

@Injectable()
export class UploadProductImageUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: IProductRepository,
    @Inject(FILE_STORAGE) private readonly storage: IFileStoragePort,
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
    return this.products.update(productId, { image: path });
  }
}
