import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
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
import { InviteOrganizationUserDto } from 'src/bff/admin-api/endpoints/organization-users/dto/invite-organization-user.dto';
import { UpdateOrganizationUserDto } from 'src/bff/admin-api/endpoints/organization-users/dto/update-organization-user.dto';
import { SuspendOrganizationUserDto } from 'src/bff/admin-api/endpoints/organization-users/dto/suspend-organization-user.dto';

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

  @ApiOperation({
    summary: 'Invite organization user',
  })
  @ApiCreatedResponse({
    description: 'The organization user has been successfully invited.',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The ID of the organization user',
          format: 'uuid',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiBadRequestResponse({
    description: 'Error inviting organization user due to validation errors.',
  })
  @Post()
  async inviteOrganizationUser(@Body() dto: InviteOrganizationUserDto) {
    const id = await this.organizationUserIamFacade.inviteOrganizationUser(
      dto.email,
      dto.displayName,
    );
    return { id };
  }

  @ApiOperation({
    summary: 'Update organization user',
  })
  @ApiOkResponse({
    description: 'The organization user has been successfully updated.',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The ID of the organization user',
          format: 'uuid',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiBadRequestResponse({
    description: 'Error updating organization user due to validation errors.',
  })
  @ApiNotFoundResponse({
    description: 'Organization user not found',
  })
  @Put(':organizationUserId')
  async updateOrganizationUser(
    @Param('organizationUserId', new ParseUUIDPipe())
    organizationUserId: string,
    @Body() dto: UpdateOrganizationUserDto,
  ) {
    await this.organizationUserIamFacade.updateOrganizationUser(
      organizationUserId,
      dto.displayName,
      dto.version,
    );
    return { id: organizationUserId };
  }

  @ApiOperation({
    summary: 'Suspend organization user',
  })
  @ApiOkResponse({
    description: 'The organization user has been successfully suspended.',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The ID of the organization user',
          format: 'uuid',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiBadRequestResponse({
    description: 'Error suspending organization user due to validation errors.',
  })
  @ApiNotFoundResponse({
    description: 'Organization user not found',
  })
  @Post(':organizationUserId/suspend')
  @HttpCode(HttpStatus.OK)
  async suspendOrganizationUser(
    @Param('organizationUserId', new ParseUUIDPipe())
    organizationUserId: string,
    @Body() dto: SuspendOrganizationUserDto,
  ) {
    await this.organizationUserIamFacade.suspendOrganizationUser(
      organizationUserId,
      dto.version,
    );
    return { id: organizationUserId };
  }
}
