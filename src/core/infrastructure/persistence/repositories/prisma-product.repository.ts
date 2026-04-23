import { Injectable } from '@nestjs/common';
import { Product } from '../../../domain/entities/product.entity';
import { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { ProductMapper } from '../mappers/product.mapper';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(product: Product): Promise<Product> {
    const created = await this.prisma.product.create({
      data: {
        name: product.name,
        description: product.description,
        image: product.image,
        thumbnail: product.thumbnail,
        stock: product.stock,
        price: product.price,
        active: product.active,
        categoryId: product.categoryId,
      },
    });
    return ProductMapper.toDomain(created);
  }

  async findById(id: string): Promise<Product | null> {
    const row = await this.prisma.product.findUnique({ where: { id } });
    return row ? ProductMapper.toDomain(row) : null;
  }

  async findAll(params?: {
    categoryId?: string;
    skip?: number;
    take?: number;
  }): Promise<Product[]> {
    const rows = await this.prisma.product.findMany({
      where: params?.categoryId ? { categoryId: params.categoryId } : undefined,
      skip: params?.skip,
      take: params?.take,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(ProductMapper.toDomain);
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      image: string;
      thumbnail: string;
      stock: number;
      price: number;
      active: boolean;
      categoryId: string;
    }>,
  ): Promise<Product> {
    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.description !== undefined
          ? { description: data.description }
          : {}),
        ...(data.image !== undefined ? { image: data.image } : {}),
        ...(data.thumbnail !== undefined ? { thumbnail: data.thumbnail } : {}),
        ...(data.stock !== undefined ? { stock: data.stock } : {}),
        ...(data.price !== undefined ? { price: data.price } : {}),
        ...(data.active !== undefined ? { active: data.active } : {}),
        ...(data.categoryId !== undefined
          ? { categoryId: data.categoryId }
          : {}),
      },
    });
    return ProductMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({ where: { id } });
  }

  async countOrderItemReferences(productId: string): Promise<number> {
    return this.prisma.orderItem.count({ where: { productId } });
  }
}
