import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DeleteUserUseCase } from '../../../application/use-cases/users/delete-user.use-case';
import { GetUserByIdUseCase } from '../../../application/use-cases/users/get-user-by-id.use-case';
import { ListUsersUseCase } from '../../../application/use-cases/users/list-users.use-case';
import { UpdateUserUseCase } from '../../../application/use-cases/users/update-user.use-case';
import { UserRole } from '../../../domain/enums/user-role.enum';
import {
  CurrentUser,
  AuthUserPayload,
} from '../../decorators/current-user.decorator';
import { Roles } from '../../decorators/roles.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { UserPublicResponse } from '../auth/dto/user-public.response';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly listUsers: ListUsersUseCase,
    private readonly getUserById: GetUserByIdUseCase,
    private readonly updateUser: UpdateUserUseCase,
    private readonly deleteUser: DeleteUserUseCase,
  ) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List all users (ADMIN)' })
  async list(): Promise<UserPublicResponse[]> {
    const users = await this.listUsers.execute();
    return users.map(UserPublicResponse.fromDomain);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id (ADMIN or self)' })
  async get(
    @Param('id') id: string,
    @CurrentUser() actor: AuthUserPayload,
  ): Promise<UserPublicResponse> {
    const user = await this.getUserById.execute(id, actor.userId, actor.role);
    return UserPublicResponse.fromDomain(user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user (ADMIN or self)' })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
    @CurrentUser() actor: AuthUserPayload,
  ): Promise<UserPublicResponse> {
    const user = await this.updateUser.execute({
      id,
      ...body,
      actorUserId: actor.userId,
      actorRole: actor.role,
    });
    return UserPublicResponse.fromDomain(user);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete user (ADMIN)' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteUser.execute(id);
  }
}
