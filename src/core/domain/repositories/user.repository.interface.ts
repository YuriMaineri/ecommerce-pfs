import { User } from '../entities/user.entity';

export interface IUserRepository {
  create(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  update(
    id: string,
    data: Partial<{ name: string; email: string; passwordHash: string }>,
  ): Promise<User>;
  delete(id: string): Promise<void>;
}
