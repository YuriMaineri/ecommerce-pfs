import { UserRole } from '../../domain/enums/user-role.enum';

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface ITokenProvider {
  sign(payload: AuthTokenPayload): string;
}
