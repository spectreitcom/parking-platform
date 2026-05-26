import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUserId } from '../../auth/decorators/current-user-id.decorator';
import { PublicApi } from '../../auth/decorators/public-api.decorator';
import { LocalAuthGuard } from '../../auth/guards/local-auth.guard';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserRequestResetPasswordTokenDto } from './dto/user-request-reset-password-token.dto';
import { UserResetPasswordTokenDto } from './dto/user-reset-password-token.dto';
import { UserChangePasswordDto } from './dto/user-change-password.dto';
import { UserRefreshTokenDto } from './dto/user-refresh-token.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RegisterUserHandler } from './handlers/register-user.handler';
import { SignInHandler } from './handlers/sign-in.handler';
import { GetMeHandler } from './handlers/get-me.handler';
import { SignOutHandler } from './handlers/sign-out.handler';
import { RequestResetPasswordTokenHandler } from './handlers/request-reset-password-token.handler';
import { ResetPasswordHandler } from './handlers/reset-password.handler';
import { ChangePasswordHandler } from './handlers/change-password.handler';
import { RefreshTokenHandler } from './handlers/refresh-token.handler';

@UseGuards(JwtAuthGuard)
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserHandler: RegisterUserHandler,
    private readonly signInHandler: SignInHandler,
    private readonly getMeHandler: GetMeHandler,
    private readonly signOutHandler: SignOutHandler,
    private readonly requestResetPasswordTokenHandler: RequestResetPasswordTokenHandler,
    private readonly resetPasswordHandler: ResetPasswordHandler,
    private readonly changePasswordHandler: ChangePasswordHandler,
    private readonly refreshTokenHandler: RefreshTokenHandler,
  ) {}

  @ApiOperation({ summary: 'Sign up with email, name and password' })
  @ApiCreatedResponse({
    description: 'User registered successfully',
  })
  @PublicApi()
  @Post('sign-up')
  async registerUser(@Body() dto: RegisterUserDto) {
    return await this.registerUserHandler.handle(dto);
  }

  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiOkResponse({
    description: 'User signed in successfully',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          description: 'JWT access token',
        },
        refreshToken: {
          type: 'string',
          description: 'JWT refresh token',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
  })
  @PublicApi()
  @UseGuards(LocalAuthGuard)
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(@CurrentUserId() userId: string) {
    return await this.signInHandler.handle(userId);
  }

  @ApiBearerAuth('auth')
  @ApiOperation({
    summary: 'Get current user',
  })
  @ApiOkResponse({
    description: 'User retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'User ID',
          format: 'uuid',
        },
        email: {
          type: 'string',
          description: 'User email',
          format: 'email',
        },
        name: {
          type: 'string',
          description: 'User name',
          example: 'John Doe',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  @Get('me')
  async me(@CurrentUserId() userId: string) {
    return await this.getMeHandler.handle(userId);
  }

  @ApiBearerAuth('auth')
  @ApiOperation({ summary: 'Sign out' })
  @ApiOkResponse({
    description: 'User signed out successfully',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'number',
          description: 'Status of the sign out operation',
          example: 200,
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  @Post('sign-out')
  @HttpCode(HttpStatus.OK)
  async signOut(@CurrentUserId() userId: string) {
    return await this.signOutHandler.handle(userId);
  }

  @ApiOperation({ summary: 'Request reset password token' })
  @ApiOkResponse({
    description: 'Reset password token requested successfully',
  })
  @PublicApi()
  @Post('request-reset-password-token')
  @HttpCode(HttpStatus.OK)
  async requestResetPasswordToken(
    @Body() dto: UserRequestResetPasswordTokenDto,
  ) {
    return await this.requestResetPasswordTokenHandler.handle(dto);
  }

  @ApiOperation({ summary: 'Reset password' })
  @ApiOkResponse({
    description: 'Password reset successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid reset password token',
  })
  @PublicApi()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPasswordToken(@Body() dto: UserResetPasswordTokenDto) {
    return await this.resetPasswordHandler.handle(dto);
  }

  @ApiBearerAuth('auth')
  @ApiOperation({ summary: 'Change password' })
  @ApiOkResponse({
    description: 'Password changed successfully',
  })
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUserId() userId: string,
    @Body() dto: UserChangePasswordDto,
  ) {
    return await this.changePasswordHandler.handle(userId, dto);
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiOkResponse({
    description: 'Access token refreshed successfully',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          description: 'JWT access token',
        },
        refreshToken: {
          type: 'string',
          description: 'JWT refresh token',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid refresh token',
  })
  @PublicApi()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() dto: UserRefreshTokenDto) {
    return await this.refreshTokenHandler.handle(dto);
  }
}
