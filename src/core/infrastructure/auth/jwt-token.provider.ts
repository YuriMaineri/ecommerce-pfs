import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  AuthTokenPayload,
  ITokenProvider,
} from '../../application/ports/token-provider.port';

@Injectable()
export class JwtTokenProvider implements ITokenProvider {
  constructor(private readonly jwtService: JwtService) {}

  sign(payload: AuthTokenPayload): string {
    return this.jwtService.sign({
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    });
  }
}
