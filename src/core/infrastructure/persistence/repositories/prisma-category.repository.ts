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
    const row = await this.prisma.category.findUnique({ where: { id } });
    return row ? CategoryMapper.toDomain(row) : null;
  }

  async findAll(): Promise<Category[]> {
    const rows = await this.prisma.category.findMany({
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
    await this.prisma.category.delete({ where: { id } });
  }

  async countProducts(categoryId: string): Promise<number> {
    return this.prisma.product.count({ where: { categoryId } });
  }
}
