import { Category } from '../entities/category.entity';

export interface ICategoryRepository {
  create(category: Category): Promise<Category>;
  findById(id: string): Promise<Category | null>;
  findAll(): Promise<Category[]>;
  update(
    id: string,
    data: Partial<{ name: string; description: string }>,
  ): Promise<Category>;
  delete(id: string): Promise<void>;
  countProducts(categoryId: string): Promise<number>;

  findDeleted(): Promise<Category[]>;

  restore(id: string): Promise<Category>;
}
