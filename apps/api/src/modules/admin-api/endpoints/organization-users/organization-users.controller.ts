import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { OrganizationUserIamFacade } from 'src/modules/organization-user-iam/application/organization-user-iam.facade';
import { GetOrganizationUsersListQueryParamsDto } from 'src/modules/admin-api/endpoints/organization-users/dto/get-organization-users-list-query-params.dto';
import { DEFAULT_PAGE_SIZE } from 'src/modules/admin-api/constants';

@ApiBearerAuth('admin-auth')
@ApiTags('Admin - Organization Users')
@Controller('admin/organization-users')
export class OrganizationUsersController {
  constructor(
    private readonly organizationUserIamFacade: OrganizationUserIamFacade,
  ) {}

  @ApiOperation({
    summary: 'Get a list of organization users',
  })
  @ApiOkResponse({
    description:
      'The list of organization users has been successfully retrieved.',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              organizationUserId: { type: 'string', format: 'uuid' },
              email: { type: 'string' },
              displayName: { type: 'string' },
              statusText: { type: 'string' },
            },
          },
        },
        total: {
          type: 'number',
        },
        currentPage: {
          type: 'number',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiBadRequestResponse({
    description: 'Validation errors',
  })
  @Get()
  async getOrganizationUsers(
    @Query() queryParams: GetOrganizationUsersListQueryParamsDto,
  ) {
    const data = await this.organizationUserIamFacade.getOrganizationUsersList(
      queryParams.page ?? 1,
      queryParams.limit ?? DEFAULT_PAGE_SIZE,
      queryParams.search,
    );
    const total =
      await this.organizationUserIamFacade.getOrganizationUsersTotal(
        queryParams.search,
      );

    return {
      data,
      total,
      currentPage: queryParams.page ?? 1,
    };
  }
}
