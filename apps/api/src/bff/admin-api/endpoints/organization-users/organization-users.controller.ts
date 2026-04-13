import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { OrganizationUserIamFacade } from 'src/modules/organization-user-iam/application/organization-user-iam.facade';
import { GetOrganizationUsersListQueryParamsDto } from 'src/bff/admin-api/endpoints/organization-users/dto/get-organization-users-list-query-params.dto';
import { DEFAULT_PAGE_SIZE } from 'src/bff/admin-api/constants';
import { JwtAuthGuard } from 'src/bff/admin-api/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
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
    const page = queryParams.page ?? 1;
    const limit = queryParams.limit ?? DEFAULT_PAGE_SIZE;

    const data = await this.organizationUserIamFacade.getOrganizationUsersList(
      page,
      limit,
      queryParams.search,
    );
    const total =
      await this.organizationUserIamFacade.getOrganizationUsersTotal(
        queryParams.search,
      );

    return {
      data,
      total,
      currentPage: page,
    };
  }

  @ApiOperation({
    summary: 'Get an organization user by id',
  })
  @ApiOkResponse({
    description: 'The organization user has been successfully retrieved.',
    schema: {
      type: 'object',
      properties: {
        organizationUserId: { type: 'string', format: 'uuid' },
        email: { type: 'string' },
        displayName: { type: 'string' },
        statusText: { type: 'string' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiBadRequestResponse({
    description: 'Validation errors',
  })
  @ApiNotFoundResponse({
    description: 'Organization user not found',
  })
  @Get(':organizationUserId')
  async getOrganizationUser(
    @Param('organizationUserId', new ParseUUIDPipe())
    organizationUserId: string,
  ) {
    return await this.organizationUserIamFacade.getOrganizationUserById(
      organizationUserId,
    );
  }
}
