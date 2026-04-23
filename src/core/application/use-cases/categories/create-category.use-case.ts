import { Inject, Injectable } from '@nestjs/common';
import { Category } from '../../../domain/entities/category.entity';
import { ICategoryRepository } from '../../../domain/repositories/category.repository.interface';
import { CATEGORY_REPOSITORY } from '../../../domain/repositories/injection-tokens';

export interface CreateCategoryInput {
  name: string;
  description: string;
}

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categories: ICategoryRepository,
  ) {}

  async execute(input: CreateCategoryInput): Promise<Category> {
    const category = new Category('', input.name, input.description);
    return this.categories.create(category);
  }
}
