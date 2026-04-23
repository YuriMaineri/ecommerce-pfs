import { Inject, Injectable } from '@nestjs/common';
import { ResourceNotFoundError } from '../../../domain/errors/application.errors';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../../domain/repositories/injection-tokens';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: IUserRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const user = await this.users.findById(id);
    if (!user) {
      throw new ResourceNotFoundError('User', id);
    }
    await this.users.delete(id);
  }
}
