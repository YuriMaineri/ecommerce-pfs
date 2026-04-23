import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../../domain/entities/user.entity';
import { ForbiddenAccessError } from '../../../domain/errors/application.errors';
import { ResourceNotFoundError } from '../../../domain/errors/application.errors';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../../domain/repositories/injection-tokens';

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: IUserRepository,
  ) {}

  async execute(
    id: string,
    actorUserId: string,
    actorRole: UserRole,
  ): Promise<User> {
    const user = await this.users.findById(id);
    if (!user) {
      throw new ResourceNotFoundError('User', id);
    }
    if (actorRole !== UserRole.ADMIN && user.id !== actorUserId) {
      throw new ForbiddenAccessError();
    }
    return user;
  }
}
