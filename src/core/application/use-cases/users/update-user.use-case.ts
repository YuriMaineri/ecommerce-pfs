import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../../domain/entities/user.entity';
import { ForbiddenAccessError } from '../../../domain/errors/application.errors';
import { ResourceNotFoundError } from '../../../domain/errors/application.errors';
import { EmailAlreadyExistsError } from '../../../domain/errors/application.errors';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../../domain/repositories/injection-tokens';
import { PASSWORD_HASHER } from '../../injection-tokens';
import { IPasswordHasher } from '../../ports/password-hasher.port';

export interface UpdateUserInput {
  id: string;
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  actorUserId: string;
  actorRole: UserRole;
}

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: IUserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(input: UpdateUserInput): Promise<User> {
    const user = await this.users.findById(input.id);
    if (!user) {
      throw new ResourceNotFoundError('User', input.id);
    }
    if (input.actorRole !== UserRole.ADMIN && user.id !== input.actorUserId) {
      throw new ForbiddenAccessError();
    }
    if (input.email && input.email.toLowerCase() !== user.email) {
      const taken = await this.users.findByEmail(input.email.toLowerCase());
      if (taken && taken.id !== user.id) {
        throw new EmailAlreadyExistsError();
      }
    }

    if (input.role !== undefined && input.role !== user.role) {
      if (input.actorRole !== UserRole.ADMIN) {
        throw new ForbiddenAccessError('Only admins can change user roles');
      }
      if (
        user.id === input.actorUserId &&
        input.role !== UserRole.ADMIN
      ) {
        throw new ForbiddenAccessError('You cannot demote your own account');
      }
    }

    const data: Partial<{
      name: string;
      email: string;
      passwordHash: string;
      role: UserRole;
    }> = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.email !== undefined) data.email = input.email.toLowerCase();
    if (input.password !== undefined) {
      data.passwordHash = await this.passwordHasher.hash(input.password);
    }
    if (input.role !== undefined) data.role = input.role;
    return this.users.update(user.id, data);
  }
}
