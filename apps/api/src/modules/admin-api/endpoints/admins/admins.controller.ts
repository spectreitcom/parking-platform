import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AdminIamFacade } from 'src/modules/admin-iam/application/admin-iam.facade';
import { GetAdminsListQueryParamsDto } from 'src/modules/admin-api/endpoints/admins/dto/get-admins-list-query-params.dto';
import { InviteAdminDto } from 'src/modules/admin-api/endpoints/admins/dto/invite-admin.dto';
import { DEFAULT_PAGE_SIZE } from 'src/modules/admin-api/constants';
import { SuperAdminGuard } from 'src/modules/admin-api/auth/guards/super-admin.guard';

@ApiBearerAuth('admin-auth')
@ApiTags('Admin - Admins')
@Controller('admin/admins')
export class AdminsController {
  constructor(private readonly adminIamFacade: AdminIamFacade) {}

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
    const data = await this.adminIamFacade.getAdminUsersList(
      queryParams.page ?? 1,
      queryParams.limit ?? DEFAULT_PAGE_SIZE,
      queryParams.search,
    );
    const total = await this.adminIamFacade.getAdminUsersTotal(
      queryParams.search,
    );
    return { data, total, currentPage: queryParams.page ?? 1 };
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
    const id = await this.adminIamFacade.inviteAdminUser(
      dto.email,
      dto.displayName,
    );
    return { id };
  }
}
