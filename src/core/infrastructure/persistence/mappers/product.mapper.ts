import {
  Category as PrismaCategory,
  Product as PrismaProduct,
} from '@prisma/client';
import { Product } from '../../../domain/entities/product.entity';
import { CategoryMapper } from './category.mapper';
import { decimalToNumber } from './decimal.util';

type ProductRow = PrismaProduct & { category?: PrismaCategory | null };

export class ProductMapper {
  static toDomain(row: ProductRow): Product {
    const category =
      row.category != null ? CategoryMapper.toDomain(row.category) : undefined;
    return new Product(
      row.id,
      row.name,
      row.description,
      row.image,
      row.thumbnail,
      row.stock,
      decimalToNumber(row.price),
      row.active,
      row.createdAt,
      row.categoryId,
      category,
    );
  }
}
