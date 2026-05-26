import {
  Body,
  Controller,
  Delete,
  Get,
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
import { CreateOrganizationDto } from 'src/bff/admin-api/endpoints/organizations/dto/create-organization.dto';
import { UpdateOrganizationDto } from 'src/bff/admin-api/endpoints/organizations/dto/update-organization.dto';
import { AddMemberToOrganizationDto } from 'src/bff/admin-api/endpoints/organizations/dto/add-member-to-organization.dto';
import { RemoveMemberFromOrganizationQueryParamsDto } from 'src/bff/admin-api/endpoints/organizations/dto/remove-member-from-organization-query-params.dto';
import { GetOrganizationListQueryParamsDto } from 'src/bff/admin-api/endpoints/organizations/dto/get-organization-list-query-params.dto';
import { SearchOrganizationUsersQueryParamsDto } from 'src/bff/admin-api/endpoints/organizations/dto/search-organization-users-query-params.dto';
import { JwtAuthGuard } from 'src/bff/admin-api/auth/guards/jwt-auth.guard';
import { SearchOrganizationUsersHandler } from './handlers/search-organization-users.handler';
import { GetOrganizationListHandler } from './handlers/get-organization-list.handler';
import { GetOrganizationByIdHandler } from './handlers/get-organization-by-id.handler';
import { CreateOrganizationHandler } from './handlers/create-organization.handler';
import { UpdateOrganizationHandler } from './handlers/update-organization.handler';
import { AddMemberToOrganizationHandler } from './handlers/add-member-to-organization.handler';
import { RemoveMemberFromOrganizationHandler } from './handlers/remove-member-from-organization.handler';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('admin-auth')
@ApiTags('Admin - Organizations')
@Controller('admin/organizations')
export class OrganizationsController {
  constructor(
    private readonly searchOrganizationUsersHandler: SearchOrganizationUsersHandler,
    private readonly getOrganizationListHandler: GetOrganizationListHandler,
    private readonly getOrganizationByIdHandler: GetOrganizationByIdHandler,
    private readonly createOrganizationHandler: CreateOrganizationHandler,
    private readonly updateOrganizationHandler: UpdateOrganizationHandler,
    private readonly addMemberToOrganizationHandler: AddMemberToOrganizationHandler,
    private readonly removeMemberFromOrganizationHandler: RemoveMemberFromOrganizationHandler,
  ) {}

  @ApiOperation({
    summary: 'Search organization users',
  })
  @ApiOkResponse({
    description:
      'The list of organization users has been successfully retrieved.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          organizationUserId: { type: 'string', format: 'uuid' },
          email: { type: 'string' },
          displayName: { type: 'string' },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @Get('users/search')
  async searchOrganizationUsers(
    @Query() queryParams: SearchOrganizationUsersQueryParamsDto,
  ) {
    return await this.searchOrganizationUsersHandler.handle(queryParams);
  }

  @ApiOperation({
    summary: 'Get a list of organizations',
  })
  @ApiOkResponse({
    description: 'The list of organizations has been successfully retrieved.',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              address: { type: 'string' },
              taxId: { type: 'string' },
              version: { type: 'number', example: 1 },
              members: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    isRoot: { type: 'boolean' },
                    organizationUserId: { type: 'string', format: 'uuid' },
                    displayName: { type: 'string' },
                    email: { type: 'string' },
                  },
                },
              },
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
  async getOrganizationList(
    @Query() queryParams: GetOrganizationListQueryParamsDto,
  ) {
    return await this.getOrganizationListHandler.handle(queryParams);
  }

  @ApiOperation({
    summary: 'Get organization by id',
  })
  @ApiOkResponse({
    description: 'The organization has been successfully retrieved.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        address: { type: 'string' },
        taxId: { type: 'string' },
        version: { type: 'number', example: 1 },
        members: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              isRoot: { type: 'boolean' },
              organizationUserId: { type: 'string', format: 'uuid' },
              displayName: { type: 'string' },
              email: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    description: 'Organization not found',
  })
  @Get(':organizationId')
  async getOrganizationById(
    @Param('organizationId', new ParseUUIDPipe()) organizationId: string,
  ) {
    return await this.getOrganizationByIdHandler.handle(organizationId);
  }

  @ApiOperation({
    summary: 'Create a new organization',
  })
  @ApiCreatedResponse({
    description: 'The organization has been successfully created.',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The ID of the created organization',
          format: 'uuid',
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
  @Post()
  async createOrganization(@Body() dto: CreateOrganizationDto) {
    return await this.createOrganizationHandler.handle(dto);
  }

  @ApiOperation({
    summary: 'Update an existing organization',
  })
  @ApiOkResponse({
    description: 'The organization has been successfully updated.',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
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
  @ApiNotFoundResponse({
    description: 'Organization not found',
  })
  @Put(':organizationId')
  async updateOrganization(
    @Param('organizationId', new ParseUUIDPipe()) organizationId: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return await this.updateOrganizationHandler.handle(organizationId, dto);
  }

  @ApiOperation({
    summary: 'Add a member to an organization',
  })
  @ApiCreatedResponse({
    description: 'The member has been successfully added to the organization.',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The ID of the member in the organization',
          format: 'uuid',
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
  @ApiNotFoundResponse({
    description: 'Organization or User not found',
  })
  @Post(':organizationId/members')
  async addMemberToOrganization(
    @Param('organizationId', new ParseUUIDPipe()) organizationId: string,
    @Body() dto: AddMemberToOrganizationDto,
  ) {
    return await this.addMemberToOrganizationHandler.handle(
      organizationId,
      dto,
    );
  }

  @ApiOperation({
    summary: 'Remove a member from an organization',
  })
  @ApiOkResponse({
    description:
      'The member has been successfully removed from the organization.',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
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
  @ApiNotFoundResponse({
    description: 'Organization or Member not found',
  })
  @Delete(':organizationId/members/:memberId')
  async removeMemberFromOrganization(
    @Param('organizationId', new ParseUUIDPipe()) organizationId: string,
    @Param('memberId', new ParseUUIDPipe()) memberId: string,
    @Query() queryParams: RemoveMemberFromOrganizationQueryParamsDto,
  ) {
    return await this.removeMemberFromOrganizationHandler.handle(
      organizationId,
      memberId,
      queryParams,
    );
  }
}
