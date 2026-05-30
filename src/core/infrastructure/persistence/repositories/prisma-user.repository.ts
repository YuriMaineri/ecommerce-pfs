import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { User } from '../../../domain/entities/user.entity';
import { UserRole } from '../../../domain/enums/user-role.enum';
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
    // Usuarios excluidos logicamente nao autenticam nem aparecem em buscas.
    const row = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
    return row ? UserMapper.toDomain(row) : null;
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
    return row ? UserMapper.toDomain(row) : null;
  }

  async findAll(): Promise<User[]> {
    const rows = await this.prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(UserMapper.toDomain);
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      email: string;
      passwordHash: string;
      role: UserRole;
    }>,
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
          ...(data.role !== undefined ? { role: data.role } : {}),
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
    // Exclusao logica.
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findDeleted(): Promise<User[]> {
    const rows = await this.prisma.user.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(UserMapper.toDomain);
  }

  async restore(id: string): Promise<User> {
    const restored = await this.prisma.user.update({
      where: { id },
      data: { deletedAt: null },
    });
    return UserMapper.toDomain(restored);
  }
}
