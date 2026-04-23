import { Inject, Injectable } from '@nestjs/common';
import { CategoryHasProductsError } from '../../../domain/errors/application.errors';
import { ResourceNotFoundError } from '../../../domain/errors/application.errors';
import { ICategoryRepository } from '../../../domain/repositories/category.repository.interface';
import { CATEGORY_REPOSITORY } from '../../../domain/repositories/injection-tokens';

@Injectable()
export class DeleteCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categories: ICategoryRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.categories.findById(id);
    if (!existing) {
      throw new ResourceNotFoundError('Category', id);
    }
    const count = await this.categories.countProducts(id);
    if (count > 0) {
      throw new CategoryHasProductsError();
    }
    await this.categories.delete(id);
  }
}
