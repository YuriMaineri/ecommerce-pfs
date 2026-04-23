import { Inject, Injectable } from '@nestjs/common';
import { Product } from '../../../domain/entities/product.entity';
import { ResourceNotFoundError } from '../../../domain/errors/application.errors';
import { ICategoryRepository } from '../../../domain/repositories/category.repository.interface';
import { CATEGORY_REPOSITORY } from '../../../domain/repositories/injection-tokens';
import { PRODUCT_REPOSITORY } from '../../../domain/repositories/injection-tokens';
import { IProductRepository } from '../../../domain/repositories/product.repository.interface';

export interface UpdateProductInput {
  id: string;
  name?: string;
  description?: string;
  image?: string;
  thumbnail?: string;
  stock?: number;
  price?: number;
  active?: boolean;
  categoryId?: string;
}

@Injectable()
export class UpdateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: IProductRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categories: ICategoryRepository,
  ) {}

  async execute(input: UpdateProductInput): Promise<Product> {
    const existing = await this.products.findById(input.id);
    if (!existing) {
      throw new ResourceNotFoundError('Product', input.id);
    }
    if (input.categoryId) {
      const category = await this.categories.findById(input.categoryId);
      if (!category) {
        throw new ResourceNotFoundError('Category', input.categoryId);
      }
    }
    const next = new Product(
      existing.id,
      input.name ?? existing.name,
      input.description ?? existing.description,
      input.image ?? existing.image,
      input.thumbnail ?? existing.thumbnail,
      input.stock ?? existing.stock,
      input.price ?? existing.price,
      input.active ?? existing.active,
      existing.createdAt,
      input.categoryId ?? existing.categoryId,
    );
    next.assertNonNegativeStock();
    next.assertPositivePrice();
    return this.products.update(input.id, {
      name: input.name,
      description: input.description,
      image: input.image,
      thumbnail: input.thumbnail,
      stock: input.stock,
      price: input.price,
      active: input.active,
      categoryId: input.categoryId,
    });
  }
}
