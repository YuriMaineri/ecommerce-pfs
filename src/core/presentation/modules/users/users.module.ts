import { Module } from '@nestjs/common';
import { DeleteUserUseCase } from '../../../application/use-cases/users/delete-user.use-case';
import { GetUserByIdUseCase } from '../../../application/use-cases/users/get-user-by-id.use-case';
import { ListUsersUseCase } from '../../../application/use-cases/users/list-users.use-case';
import { UpdateUserUseCase } from '../../../application/use-cases/users/update-user.use-case';
import { AuthModule } from '../auth/auth.module';
import { RepositoriesModule } from '../repositories.module';
import { UsersController } from './users.controller';

@Module({
  imports: [RepositoriesModule, AuthModule],
  controllers: [UsersController],
  providers: [
    ListUsersUseCase,
    GetUserByIdUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
  ],
})
export class UsersModule {}
