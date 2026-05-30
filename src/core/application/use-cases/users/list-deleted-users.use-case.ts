import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../../domain/entities/user.entity';
import { USER_REPOSITORY } from '../../../domain/repositories/injection-tokens';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class ListDeletedUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: IUserRepository,
  ) {}

  async execute(): Promise<User[]> {
    return this.users.findDeleted();
  }
}
