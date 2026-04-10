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
import { UserIamFacade } from 'src/modules/user-iam/application/user-iam.facade';
import { CurrentUserId } from '../../auth/decorators/current-user-id.decorator';
import { PublicApi } from '../../auth/decorators/public-api.decorator';
import { LocalAuthGuard } from '../../auth/guards/local-auth.guard';
import { RegisterUserDto } from './dto/register-user.dto';
import { RequestResetPasswordTokenDto } from './dto/request-reset-password-token.dto';
import { ResetPasswordTokenDto } from './dto/reset-password-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from 'src/bff/api/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly userIamFacade: UserIamFacade) {}

  @ApiOperation({ summary: 'Sign up with email, name and password' })
  @ApiCreatedResponse({
    description: 'User registered successfully',
  })
  @PublicApi()
  @Post('sign-up')
  async registerUser(@Body() dto: RegisterUserDto) {
    return await this.userIamFacade.registerUser(
      dto.email,
      dto.name,
      dto.password,
    );
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
    return await this.userIamFacade.signIn(userId);
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
    return await this.userIamFacade.getUserById(userId);
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
    await this.userIamFacade.signOut(userId);
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
    await this.userIamFacade.requestResetPassword(dto.email);
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
  async resetPasswordToken(@Body() dto: ResetPasswordTokenDto) {
    await this.userIamFacade.resetPassword(dto.token, dto.password);
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
    @Body() dto: ChangePasswordDto,
  ) {
    await this.userIamFacade.changePassword(
      userId,
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
    return await this.userIamFacade.refreshToken(dto.refreshToken);
  }
}
