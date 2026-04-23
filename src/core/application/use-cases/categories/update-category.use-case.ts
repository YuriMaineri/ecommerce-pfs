import { Inject, Injectable } from '@nestjs/common';
import { Category } from '../../../domain/entities/category.entity';
import { ResourceNotFoundError } from '../../../domain/errors/application.errors';
import { ICategoryRepository } from '../../../domain/repositories/category.repository.interface';
import { CATEGORY_REPOSITORY } from '../../../domain/repositories/injection-tokens';

export interface UpdateCategoryInput {
  id: string;
  name?: string;
  description?: string;
}

@Injectable()
export class UpdateCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categories: ICategoryRepository,
  ) {}

  async execute(input: UpdateCategoryInput): Promise<Category> {
    const existing = await this.categories.findById(input.id);
    if (!existing) {
      throw new ResourceNotFoundError('Category', input.id);
    }
    return this.categories.update(input.id, {
      name: input.name,
      description: input.description,
    });
  }
}
