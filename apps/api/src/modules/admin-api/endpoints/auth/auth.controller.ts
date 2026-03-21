import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminIamFacade } from '../../../admin-iam/application/admin-iam.facade';
import { CurrentAdminUserId } from '../../auth/decorators/current-admin-user-id.decorator';
import { PublicApi } from '../../auth/decorators/public-api.decorator';
import { LocalAuthGuard } from '../../auth/guards/local-auth.guard';

@ApiTags('Admin Auth')
@Controller('admin/auth')
export class AuthController {
  constructor(private readonly adminIamFacade: AdminIamFacade) {}

  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiResponse({
    status: HttpStatus.OK,
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
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
  })
  @PublicApi()
  @UseGuards(LocalAuthGuard)
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(@CurrentAdminUserId() adminUserId: string) {
    return await this.adminIamFacade.signIn(adminUserId);
  }

  @ApiBearerAuth('admin-auth')
  @ApiOperation({
    summary: 'Get current admin user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
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
  @ApiResponse({
    status: HttpStatus.OK,
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
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Admin not authenticated',
  })
  @Post('sign-out')
  @HttpCode(HttpStatus.OK)
  async signOut(@CurrentAdminUserId() adminUserId: string) {
    await this.adminIamFacade.signOut(adminUserId);
    return { status: HttpStatus.OK };
  }
}
