import { Injectable } from '@nestjs/common';
import { Category } from '../../../domain/entities/category.entity';
import { ICategoryRepository } from '../../../domain/repositories/category.repository.interface';
import { CategoryMapper } from '../mappers/category.mapper';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(category: Category): Promise<Category> {
    const created = await this.prisma.category.create({
      data: {
        name: category.name,
        description: category.description,
      },
    });
    return CategoryMapper.toDomain(created);
  }

  async findById(id: string): Promise<Category | null> {
    const row = await this.prisma.category.findFirst({
      where: { id, deletedAt: null },
    });
    return row ? CategoryMapper.toDomain(row) : null;
  }

  async findAll(): Promise<Category[]> {
    const rows = await this.prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
    return rows.map(CategoryMapper.toDomain);
  }

  async update(
    id: string,
    data: Partial<{ name: string; description: string }>,
  ): Promise<Category> {
    const updated = await this.prisma.category.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.description !== undefined
          ? { description: data.description }
          : {}),
      },
    });
    return CategoryMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    // Exclusao logica.
    await this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async countProducts(categoryId: string): Promise<number> {
    // Considera apenas produtos ativos (nao excluidos logicamente).
    return this.prisma.product.count({
      where: { categoryId, deletedAt: null },
    });
  }

  async findDeleted(): Promise<Category[]> {
    const rows = await this.prisma.category.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { name: 'asc' },
    });
    return rows.map(CategoryMapper.toDomain);
  }

  async restore(id: string): Promise<Category> {
    const restored = await this.prisma.category.update({
      where: { id },
      data: { deletedAt: null },
    });
    return CategoryMapper.toDomain(restored);
  }
}
