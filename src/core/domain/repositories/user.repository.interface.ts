import { User } from '../entities/user.entity';
import { UserRole } from '../enums/user-role.enum';

export interface IUserRepository {
  create(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  update(
    id: string,
    data: Partial<{
      name: string;
      email: string;
      passwordHash: string;
      role: UserRole;
    }>,
  ): Promise<User>;
  delete(id: string): Promise<void>;

  findDeleted(): Promise<User[]>;

  restore(id: string): Promise<User>;
}
