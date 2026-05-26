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
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentAdminUserId } from '../../auth/decorators/current-admin-user-id.decorator';
import { PublicApi } from '../../auth/decorators/public-api.decorator';
import { LocalAuthGuard } from '../../auth/guards/local-auth.guard';
import { AdminRequestResetPasswordTokenDto } from './dto/admin-request-reset-password-token.dto';
import { AdminResetPasswordTokenDto } from './dto/admin-reset-password-token.dto';
import { AdminChangePasswordDto } from './dto/admin-change-password.dto';
import { AdminRefreshTokenDto } from './dto/admin-refresh-token.dto';
import { JwtAuthGuard } from 'src/bff/admin-api/auth/guards/jwt-auth.guard';
import { AdminSignInHandler } from './handlers/admin-sign-in.handler';
import { GetAdminMeHandler } from './handlers/get-admin-me.handler';
import { AdminSignOutHandler } from './handlers/admin-sign-out.handler';
import { AdminRequestResetPasswordTokenHandler } from './handlers/admin-request-reset-password-token.handler';
import { AdminResetPasswordHandler } from './handlers/admin-reset-password.handler';
import { AdminChangePasswordHandler } from './handlers/admin-change-password.handler';
import { AdminRefreshTokenHandler } from './handlers/admin-refresh-token.handler';

@UseGuards(JwtAuthGuard)
@ApiTags('Admin Auth')
@Controller('admin/auth')
export class AuthController {
  constructor(
    private readonly adminSignInHandler: AdminSignInHandler,
    private readonly getAdminMeHandler: GetAdminMeHandler,
    private readonly adminSignOutHandler: AdminSignOutHandler,
    private readonly adminRequestResetPasswordTokenHandler: AdminRequestResetPasswordTokenHandler,
    private readonly adminResetPasswordHandler: AdminResetPasswordHandler,
    private readonly adminChangePasswordHandler: AdminChangePasswordHandler,
    private readonly adminRefreshTokenHandler: AdminRefreshTokenHandler,
  ) {}

  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiOkResponse({
    description: 'Admin signed in successfully',
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
  @UseGuards(LocalAuthGuard)
  @PublicApi()
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(@CurrentAdminUserId() adminUserId: string) {
    return await this.adminSignInHandler.handle(adminUserId);
  }

  @ApiBearerAuth('admin-auth')
  @ApiOperation({
    summary: 'Get current admin user',
  })
  @ApiOkResponse({
    description: 'Admin user retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Admin user ID',
          format: 'uuid',
        },
        email: {
          type: 'string',
          description: 'Admin user email',
          format: 'email',
        },
        displayName: {
          type: 'string',
          description: 'Admin user display name',
          example: 'John Doe',
        },
        isSuperAdmin: {
          type: 'boolean',
          description: 'Indicates if the admin user is a super admin',
          format: 'boolean',
        },
      },
    },
  })
  @Get('me')
  async me(@CurrentAdminUserId() adminUserId: string) {
    return await this.getAdminMeHandler.handle(adminUserId);
  }

  @ApiBearerAuth('admin-auth')
  @ApiOperation({ summary: 'Sign out' })
  @ApiOkResponse({
    description: 'Admin signed out successfully',
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
    description: 'Admin not authenticated',
  })
  @Post('sign-out')
  @HttpCode(HttpStatus.OK)
  async signOut(@CurrentAdminUserId() adminUserId: string) {
    return await this.adminSignOutHandler.handle(adminUserId);
  }

  @ApiOperation({ summary: 'Request reset password token' })
  @ApiOkResponse({
    description: 'Reset password token requested successfully',
  })
  @PublicApi()
  @Post('request-reset-password-token')
  @HttpCode(HttpStatus.OK)
  async requestResetPasswordToken(
    @Body() dto: AdminRequestResetPasswordTokenDto,
  ) {
    return await this.adminRequestResetPasswordTokenHandler.handle(dto);
  }

  @ApiOperation({ summary: 'Reset password' })
  @ApiOkResponse({
    description: 'Password reset successfully',
  })
  @PublicApi()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPasswordToken(@Body() dto: AdminResetPasswordTokenDto) {
    return await this.adminResetPasswordHandler.handle(dto);
  }

  @ApiBearerAuth('admin-auth')
  @ApiOperation({ summary: 'Change password' })
  @ApiOkResponse({
    description: 'Password changed successfully',
  })
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentAdminUserId() adminUserId: string,
    @Body() dto: AdminChangePasswordDto,
  ) {
    return await this.adminChangePasswordHandler.handle(adminUserId, dto);
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
  async refreshToken(@Body() dto: AdminRefreshTokenDto) {
    return await this.adminRefreshTokenHandler.handle(dto);
  }
}
