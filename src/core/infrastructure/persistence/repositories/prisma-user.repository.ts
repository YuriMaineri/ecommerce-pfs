import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { User } from '../../../domain/entities/user.entity';
import { EmailAlreadyExistsError } from '../../../domain/errors/application.errors';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { UserMapper } from '../mappers/user.mapper';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: User): Promise<User> {
    try {
      const created = await this.prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          password: user.passwordHash,
          role: user.role,
        },
      });
      return UserMapper.toDomain(created);
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new EmailAlreadyExistsError();
      }
      throw e;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { email } });
    return row ? UserMapper.toDomain(row) : null;
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    return row ? UserMapper.toDomain(row) : null;
  }

  async findAll(): Promise<User[]> {
    const rows = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(UserMapper.toDomain);
  }

  async update(
    id: string,
    data: Partial<{ name: string; email: string; passwordHash: string }>,
  ): Promise<User> {
    try {
      const updated = await this.prisma.user.update({
        where: { id },
        data: {
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.email !== undefined ? { email: data.email } : {}),
          ...(data.passwordHash !== undefined
            ? { password: data.passwordHash }
            : {}),
        },
      });
      return UserMapper.toDomain(updated);
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new EmailAlreadyExistsError();
      }
      throw e;
    }
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}
