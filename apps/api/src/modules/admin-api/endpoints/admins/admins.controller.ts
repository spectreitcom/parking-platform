import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AdminIamFacade } from 'src/modules/admin-iam/application/admin-iam.facade';
import { GetAdminsListQueryParamsDto } from 'src/modules/admin-api/endpoints/admins/dto/get-admins-list-query-params.dto';
import { DEFAULT_PAGE_SIZE } from 'src/modules/admin-api/constants';

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
}
