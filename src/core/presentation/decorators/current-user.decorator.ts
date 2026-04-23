import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '../../domain/enums/user-role.enum';

export type AuthUserPayload = {
  userId: string;
  email: string;
  role: UserRole;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUserPayload => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthUserPayload }>();
    return request.user;
  },
);
