import { Category as PrismaCategory } from '@prisma/client';
import { Category } from '../../../domain/entities/category.entity';

export class CategoryMapper {
  static toDomain(row: PrismaCategory): Category {
    return new Category(row.id, row.name, row.description);
  }
}
