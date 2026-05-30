import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Product } from '../../../domain/entities/product.entity';
import {
  IProductRepository,
  PaginatedProducts,
  ProductFilters,
} from '../../../domain/repositories/product.repository.interface';
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
      include: { category: true },
    });
    return ProductMapper.toDomain(created);
  }

  async findById(id: string): Promise<Product | null> {
    // Ignora produtos com exclusao logica.
    const row = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: { category: true },
    });
    return row ? ProductMapper.toDomain(row) : null;
  }

  async findAll(params?: {
    categoryId?: string;
    skip?: number;
    take?: number;
  }): Promise<Product[]> {
    const rows = await this.prisma.product.findMany({
      where: {
        deletedAt: null,
        ...(params?.categoryId ? { categoryId: params.categoryId } : {}),
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
    return rows.map(ProductMapper.toDomain);
  }

  async findPaginated(filters: ProductFilters): Promise<PaginatedProducts> {
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters.active !== undefined ? { active: filters.active } : {}),
      ...(filters.search
        ? { name: { contains: filters.search, mode: 'insensitive' } }
        : {}),
      ...(filters.minPrice !== undefined || filters.maxPrice !== undefined
        ? {
            price: {
              ...(filters.minPrice !== undefined
                ? { gte: filters.minPrice }
                : {}),
              ...(filters.maxPrice !== undefined
                ? { lte: filters.maxPrice }
                : {}),
            },
          }
        : {}),
    };

    const sortBy = filters.sortBy ?? 'createdAt';
    const order = filters.order ?? 'desc';
    const skip = (filters.page - 1) * filters.pageSize;

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        orderBy: { [sortBy]: order },
        skip,
        take: filters.pageSize,
        include: { category: true },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items: rows.map(ProductMapper.toDomain), total };
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
      include: { category: true },
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
    // Exclusao logica: marca a data em vez de remover do banco.
    await this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async countOrderItemReferences(productId: string): Promise<number> {
    return this.prisma.orderItem.count({ where: { productId } });
  }

  async findDeleted(): Promise<Product[]> {
    const rows = await this.prisma.product.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
    return rows.map(ProductMapper.toDomain);
  }

  async restore(id: string): Promise<Product> {
    const restored = await this.prisma.product.update({
      where: { id },
      data: { deletedAt: null },
      include: { category: true },
    });
    return ProductMapper.toDomain(restored);
  }
}
