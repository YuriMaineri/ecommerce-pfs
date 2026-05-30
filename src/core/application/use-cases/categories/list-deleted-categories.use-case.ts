import { Inject, Injectable } from '@nestjs/common';
import { Category } from '../../../domain/entities/category.entity';
import { CATEGORY_REPOSITORY } from '../../../domain/repositories/injection-tokens';
import { ICategoryRepository } from '../../../domain/repositories/category.repository.interface';

@Injectable()
export class ListDeletedCategoriesUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categories: ICategoryRepository,
  ) {}

  async execute(): Promise<Category[]> {
    return this.categories.findDeleted();
  }
}
