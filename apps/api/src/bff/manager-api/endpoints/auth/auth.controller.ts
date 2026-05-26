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
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentManagerUser } from '../../auth/decorators/current-manager-user.decorator';
import type { RequestUser } from '../../auth/types';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { LocalAuthGuard } from '../../auth/guards/local-auth.guard';
import { PublicApi } from '../../auth/decorators/public-api.decorator';
import { ManagerRequestResetPasswordTokenDto } from './dto/manager-request-reset-password-token.dto';
import { ManagerResetPasswordTokenDto } from './dto/manager-reset-password-token.dto';
import { ManagerChangePasswordDto } from './dto/manager-change-password.dto';
import { ManagerRefreshTokenDto } from './dto/manager-refresh-token.dto';
import { GetManagerMeHandler } from './handlers/get-manager-me.handler';
import { ManagerSignInHandler } from './handlers/manager-sign-in.handler';
import { ManagerRefreshTokenHandler } from './handlers/manager-refresh-token.handler';
import { ManagerRequestResetPasswordTokenHandler } from './handlers/manager-request-reset-password-token.handler';
import { ManagerSignOutHandler } from './handlers/manager-sign-out.handler';
import { ManagerResetPasswordHandler } from './handlers/manager-reset-password.handler';
import { ManagerChangePasswordHandler } from './handlers/manager-change-password.handler';

@UseGuards(JwtAuthGuard)
@ApiTags('Manager Auth')
@Controller('manager/auth')
export class AuthController {
  constructor(
    private readonly getManagerMeHandler: GetManagerMeHandler,
    private readonly managerSignInHandler: ManagerSignInHandler,
    private readonly managerRefreshTokenHandler: ManagerRefreshTokenHandler,
    private readonly managerRequestResetPasswordTokenHandler: ManagerRequestResetPasswordTokenHandler,
    private readonly managerSignOutHandler: ManagerSignOutHandler,
    private readonly managerResetPasswordHandler: ManagerResetPasswordHandler,
    private readonly managerChangePasswordHandler: ManagerChangePasswordHandler,
  ) {}

  @ApiBearerAuth('manager-auth')
  @Get('me')
  @ApiOperation({
    summary: 'Get current manager user information',
  })
  @ApiOkResponse({
    description: 'Manager user information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        organizationUserId: { type: 'string', format: 'uuid' },
        email: { type: 'string', format: 'email' },
        displayName: { type: 'string' },
        statusText: { type: 'string' },
        organizations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              isRoot: { type: 'boolean' },
            },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access',
  })
  async me(@CurrentManagerUser() managerUser: RequestUser) {
    return await this.getManagerMeHandler.handle(managerUser);
  }

  @ApiOperation({
    summary: 'Sign in with email and password',
  })
  @ApiOkResponse({
    description: 'Manager signed in successfully',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          description: 'JWT access token',
          format: 'jwt',
        },
        refreshToken: {
          type: 'string',
          format: 'jwt',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string' },
      },
    },
  })
  @UseGuards(LocalAuthGuard)
  @PublicApi()
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(@CurrentManagerUser() managerUser: RequestUser) {
    return await this.managerSignInHandler.handle(managerUser.id);
  }

  @ApiOperation({
    summary: 'Refresh manager auth tokens',
  })
  @ApiOkResponse({
    description: 'Manager tokens refreshed successfully',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          description: 'JWT access token',
          format: 'jwt',
        },
        refreshToken: {
          type: 'string',
          format: 'jwt',
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
  async refreshToken(@Body() dto: ManagerRefreshTokenDto) {
    return await this.managerRefreshTokenHandler.handle(dto);
  }

  @ApiOperation({
    summary: 'Request a reset password token for manager',
  })
  @ApiOkResponse({
    description: 'Reset password token requested successfully',
  })
  @PublicApi()
  @Post('request-reset-password-token')
  @HttpCode(HttpStatus.OK)
  async requestResetPasswordToken(
    @Body() dto: ManagerRequestResetPasswordTokenDto,
  ) {
    return await this.managerRequestResetPasswordTokenHandler.handle(dto);
  }

  @ApiBearerAuth('manager-auth')
  @ApiOperation({
    summary: 'Sign out manager',
  })
  @ApiOkResponse({
    description: 'Manager signed out successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', enum: [HttpStatus.OK] },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Manager not authenticated',
  })
  @Post('sign-out')
  @HttpCode(HttpStatus.OK)
  async signOut(@CurrentManagerUser() managerUser: RequestUser) {
    return await this.managerSignOutHandler.handle(managerUser.id);
  }

  @ApiOperation({ summary: 'Reset password' })
  @ApiOkResponse({
    description: 'Password reset successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', enum: [HttpStatus.OK] },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid reset password token',
  })
  @PublicApi()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPasswordToken(@Body() dto: ManagerResetPasswordTokenDto) {
    return await this.managerResetPasswordHandler.handle(dto);
  }

  @ApiBearerAuth('manager-auth')
  @ApiOperation({ summary: 'Change password' })
  @ApiOkResponse({
    description: 'Password changed successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', enum: [HttpStatus.OK] },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Manager not authenticated',
  })
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentManagerUser() managerUser: RequestUser,
    @Body() dto: ManagerChangePasswordDto,
  ) {
    return await this.managerChangePasswordHandler.handle(managerUser.id, dto);
  }
}
