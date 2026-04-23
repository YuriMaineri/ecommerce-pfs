import { Inject, Injectable } from '@nestjs/common';
import { Product } from '../../../domain/entities/product.entity';
import { ResourceNotFoundError } from '../../../domain/errors/application.errors';
import { PRODUCT_REPOSITORY } from '../../../domain/repositories/injection-tokens';
import { IProductRepository } from '../../../domain/repositories/product.repository.interface';

@Injectable()
export class GetProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: IProductRepository,
  ) {}

  async execute(id: string): Promise<Product> {
    const product = await this.products.findById(id);
    if (!product) {
      throw new ResourceNotFoundError('Product', id);
    }
    return product;
  }
}
