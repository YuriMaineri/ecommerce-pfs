import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetProfileUseCase } from '../../../application/use-cases/auth/get-profile.use-case';
import { LoginUserUseCase } from '../../../application/use-cases/auth/login-user.use-case';
import { RegisterUserUseCase } from '../../../application/use-cases/auth/register-user.use-case';
import {
  CurrentUser,
  AuthUserPayload,
} from '../../decorators/current-user.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserPublicResponse } from './dto/user-public.response';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly loginUser: LoginUserUseCase,
    private readonly getProfile: GetProfileUseCase,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new customer account' })
  async register(@Body() body: RegisterDto): Promise<UserPublicResponse> {
    const user = await this.registerUser.execute(body);
    return UserPublicResponse.fromDomain(user);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate and receive JWT' })
  async login(@Body() body: LoginDto) {
    return this.loginUser.execute(body);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Current authenticated user' })
  async me(@CurrentUser() actor: AuthUserPayload): Promise<UserPublicResponse> {
    const user = await this.getProfile.execute(actor.userId);
    return UserPublicResponse.fromDomain(user);
  }
}
