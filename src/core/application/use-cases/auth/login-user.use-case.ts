import { Inject, Injectable } from '@nestjs/common';
import { InvalidCredentialsError } from '../../../domain/errors/application.errors';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../../domain/repositories/injection-tokens';
import { PASSWORD_HASHER } from '../../injection-tokens';
import { TOKEN_PROVIDER } from '../../injection-tokens';
import { IPasswordHasher } from '../../ports/password-hasher.port';
import { ITokenProvider } from '../../ports/token-provider.port';
import { User } from '../../../domain/entities/user.entity';

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface LoginUserResult {
  accessToken: string;
  user: Pick<User, 'id' | 'name' | 'email' | 'role'>;
}

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: IUserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: IPasswordHasher,
    @Inject(TOKEN_PROVIDER) private readonly tokens: ITokenProvider,
  ) {}

  async execute(input: LoginUserInput): Promise<LoginUserResult> {
    const user = await this.users.findByEmail(input.email.toLowerCase());
    if (!user) {
      throw new InvalidCredentialsError();
    }
    const ok = await this.passwordHasher.compare(
      input.password,
      user.passwordHash,
    );
    if (!ok) {
      throw new InvalidCredentialsError();
    }
    const accessToken = this.tokens.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
