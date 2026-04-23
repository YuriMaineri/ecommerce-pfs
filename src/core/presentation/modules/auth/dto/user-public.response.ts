import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../../domain/enums/user-role.enum';
import { User } from '../../../../domain/entities/user.entity';

export class UserPublicResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ enum: UserRole })
  role!: UserRole;

  @ApiProperty()
  createdAt!: Date;

  static fromDomain(user: User): UserPublicResponse {
    const dto = new UserPublicResponse();
    dto.id = user.id;
    dto.name = user.name;
    dto.email = user.email;
    dto.role = user.role;
    dto.createdAt = user.createdAt;
    return dto;
  }
}
