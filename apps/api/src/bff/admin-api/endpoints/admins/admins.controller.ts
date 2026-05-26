import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
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
import { GetAdminsListQueryParamsDto } from 'src/bff/admin-api/endpoints/admins/dto/get-admins-list-query-params.dto';
import { InviteAdminDto } from 'src/bff/admin-api/endpoints/admins/dto/invite-admin.dto';
import { SuperAdminGuard } from 'src/bff/admin-api/auth/guards/super-admin.guard';
import { SuspendAdminUserDto } from 'src/bff/admin-api/endpoints/admins/dto/suspend-admin-user.dto';
import { ActivateAdminUserDto } from 'src/bff/admin-api/endpoints/admins/dto/activate-admin-user.dto';
import { JwtAuthGuard } from 'src/bff/admin-api/auth/guards/jwt-auth.guard';
import { GetAdminsListHandler } from './handlers/get-admins-list.handler';
import { InviteAdminHandler } from './handlers/invite-admin.handler';
import { SuspendAdminUserHandler } from './handlers/suspend-admin-user.handler';
import { ActivateAdminUserHandler } from './handlers/activate-admin-user.handler';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('admin-auth')
@ApiTags('Admin - Admins')
@Controller('admin/admins')
export class AdminsController {
  constructor(
    private readonly getAdminsListHandler: GetAdminsListHandler,
    private readonly inviteAdminHandler: InviteAdminHandler,
    private readonly suspendAdminUserHandler: SuspendAdminUserHandler,
    private readonly activateAdminUserHandler: ActivateAdminUserHandler,
  ) {}

  @ApiOperation({
    summary: 'Get admins list',
  })
  @ApiOkResponse({
    description: 'The admins list has been successfully retrieved.',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'The ID of the admin',
                format: 'uuid',
              },
              email: {
                type: 'string',
                example: 'admin@example.com',
              },
              displayName: {
                type: 'string',
                example: 'Admin User',
              },
              statusText: {
                type: 'string',
                example: 'Active',
              },
            },
          },
        },
        total: {
          type: 'number',
          example: 10,
        },
        currentPage: {
          type: 'number',
          example: 1,
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiBadRequestResponse({
    description: 'Error retrieving admins list due to validation errors.',
  })
  @Get()
  async getAdminsList(@Query() queryParams: GetAdminsListQueryParamsDto) {
    return await this.getAdminsListHandler.handle(queryParams);
  }

  @ApiOperation({
    summary: 'Invite admin',
  })
  @ApiCreatedResponse({
    description: 'The admin has been successfully invited.',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The ID of the admin',
          format: 'uuid',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiBadRequestResponse({
    description: 'Error inviting admin due to validation errors.',
  })
  @UseGuards(SuperAdminGuard)
  @Post('invite')
  async inviteAdmin(@Body() dto: InviteAdminDto) {
    return await this.inviteAdminHandler.handle(dto);
  }

  @ApiOperation({
    summary: 'Suspend admin user',
  })
  @ApiOkResponse({
    description: 'The admin user has been successfully suspended.',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The ID of the admin',
          format: 'uuid',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiBadRequestResponse({
    description: 'Error suspending admin user due to validation errors.',
  })
  @UseGuards(SuperAdminGuard)
  @Post(':adminUserId/suspend')
  @HttpCode(HttpStatus.OK)
  async suspendAdminUser(
    @Param('adminUserId', new ParseUUIDPipe()) adminUserId: string,
    @Body() dto: SuspendAdminUserDto,
  ) {
    return await this.suspendAdminUserHandler.handle(adminUserId, dto);
  }

  @ApiOperation({
    summary: 'Activate admin user',
  })
  @ApiOkResponse({
    description: 'The admin user has been successfully activated.',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The ID of the admin',
          format: 'uuid',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiBadRequestResponse({
    description: 'Error activating admin user due to validation errors.',
  })
  @UseGuards(SuperAdminGuard)
  @Post(':adminUserId/activate')
  @HttpCode(HttpStatus.OK)
  async activateAdminUser(
    @Param('adminUserId', new ParseUUIDPipe()) adminUserId: string,
    @Body() dto: ActivateAdminUserDto,
  ) {
    return await this.activateAdminUserHandler.handle(adminUserId, dto);
  }
}
