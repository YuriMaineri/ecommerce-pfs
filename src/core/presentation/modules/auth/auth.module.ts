import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { GetProfileUseCase } from '../../../application/use-cases/auth/get-profile.use-case';
import { LoginUserUseCase } from '../../../application/use-cases/auth/login-user.use-case';
import { RegisterUserUseCase } from '../../../application/use-cases/auth/register-user.use-case';
import {
  PASSWORD_HASHER,
  TOKEN_PROVIDER,
} from '../../../application/injection-tokens';
import { BcryptPasswordHasher } from '../../../infrastructure/auth/bcrypt-password.hasher';
import { JwtStrategy } from '../../../infrastructure/auth/jwt.strategy';
import { JwtTokenProvider } from '../../../infrastructure/auth/jwt-token.provider';
import { RepositoriesModule } from '../repositories.module';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    RepositoriesModule,
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN', '1d'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    BcryptPasswordHasher,
    JwtTokenProvider,
    { provide: PASSWORD_HASHER, useExisting: BcryptPasswordHasher },
    { provide: TOKEN_PROVIDER, useExisting: JwtTokenProvider },
    RegisterUserUseCase,
    LoginUserUseCase,
    GetProfileUseCase,
  ],
  exports: [JwtModule, PassportModule, PASSWORD_HASHER],
})
export class AuthModule {}
