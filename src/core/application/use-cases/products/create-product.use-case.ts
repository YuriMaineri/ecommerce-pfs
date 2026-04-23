import { Inject, Injectable } from '@nestjs/common';
import { Product } from '../../../domain/entities/product.entity';
import { ResourceNotFoundError } from '../../../domain/errors/application.errors';
import { ICategoryRepository } from '../../../domain/repositories/category.repository.interface';
import { CATEGORY_REPOSITORY } from '../../../domain/repositories/injection-tokens';
import { PRODUCT_REPOSITORY } from '../../../domain/repositories/injection-tokens';
import { IProductRepository } from '../../../domain/repositories/product.repository.interface';

export interface CreateProductInput {
  name: string;
  description: string;
  image?: string;
  thumbnail?: string;
  stock: number;
  price: number;
  active?: boolean;
  categoryId: string;
}

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: IProductRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categories: ICategoryRepository,
  ) {}

  async execute(input: CreateProductInput): Promise<Product> {
    const category = await this.categories.findById(input.categoryId);
    if (!category) {
      throw new ResourceNotFoundError('Category', input.categoryId);
    }
    const product = new Product(
      '',
      input.name,
      input.description,
      input.image ?? '',
      input.thumbnail ?? '',
      input.stock,
      input.price,
      input.active ?? true,
      new Date(),
      input.categoryId,
    );
    product.assertNonNegativeStock();
    product.assertPositivePrice();
    return this.products.create(product);
  }
}
