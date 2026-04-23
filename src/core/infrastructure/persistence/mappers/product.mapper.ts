import { Product as PrismaProduct } from '@prisma/client';
import { Product } from '../../../domain/entities/product.entity';
import { decimalToNumber } from './decimal.util';

export class ProductMapper {
  static toDomain(row: PrismaProduct): Product {
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
    );
  }
}
