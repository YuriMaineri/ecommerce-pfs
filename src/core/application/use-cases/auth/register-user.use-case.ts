import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../../domain/entities/user.entity';
import { EmailAlreadyExistsError } from '../../../domain/errors/application.errors';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../../domain/repositories/injection-tokens';
import { PASSWORD_HASHER } from '../../injection-tokens';
import { IPasswordHasher } from '../../ports/password-hasher.port';

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: IUserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(input: RegisterUserInput): Promise<User> {
    const existing = await this.users.findByEmail(input.email.toLowerCase());
    if (existing) {
      throw new EmailAlreadyExistsError();
    }
    const passwordHash = await this.passwordHasher.hash(input.password);
    const role = UserRole.CUSTOMER;
    const user = new User(
      '',
      input.name,
      input.email.toLowerCase(),
      passwordHash,
      role,
      new Date(),
    );
    return this.users.create(user);
  }
}
