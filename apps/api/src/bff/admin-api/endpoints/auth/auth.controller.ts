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
import { AdminIamFacade } from 'src/modules/admin-iam/application/admin-iam.facade';
import { CurrentAdminUserId } from '../../auth/decorators/current-admin-user-id.decorator';
import { PublicApi } from '../../auth/decorators/public-api.decorator';
import { LocalAuthGuard } from '../../auth/guards/local-auth.guard';
import { RequestResetPasswordTokenDto } from './dto/request-reset-password-token.dto';
import { ResetPasswordTokenDto } from './dto/reset-password-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from 'src/bff/admin-api/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@ApiTags('Admin Auth')
@Controller('admin/auth')
export class AuthController {
  constructor(private readonly adminIamFacade: AdminIamFacade) {}

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
    return await this.adminIamFacade.signIn(adminUserId);
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
    return await this.adminIamFacade.getAdminUserById(adminUserId);
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
    await this.adminIamFacade.signOut(adminUserId);
    return { status: HttpStatus.OK };
  }

  @ApiOperation({ summary: 'Request reset password token' })
  @ApiOkResponse({
    description: 'Reset password token requested successfully',
  })
  @PublicApi()
  @Post('request-reset-password-token')
  @HttpCode(HttpStatus.OK)
  async requestResetPasswordToken(@Body() dto: RequestResetPasswordTokenDto) {
    await this.adminIamFacade.requestResetPassword(dto.email);
  }

  @ApiOperation({ summary: 'Reset password' })
  @ApiOkResponse({
    description: 'Password reset successfully',
  })
  @PublicApi()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPasswordToken(@Body() dto: ResetPasswordTokenDto) {
    await this.adminIamFacade.resetPassword(dto.token, dto.password);
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
    @Body() dto: ChangePasswordDto,
  ) {
    await this.adminIamFacade.changePassword(
      adminUserId,
      dto.existingPassword,
      dto.newPassword,
    );
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
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return await this.adminIamFacade.refreshToken(dto.refreshToken);
  }
}
