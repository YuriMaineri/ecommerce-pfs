import { User as PrismaUser } from '@prisma/client';
import { User } from '../../../domain/entities/user.entity';
import { UserRole } from '../../../domain/enums/user-role.enum';

export class UserMapper {
  static toDomain(row: PrismaUser): User {
    return new User(
      row.id,
      row.name,
      row.email,
      row.password,
      row.role as UserRole,
      row.createdAt,
    );
  }
}
