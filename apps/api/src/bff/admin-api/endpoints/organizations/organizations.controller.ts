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
import { OrganizationFacade } from 'src/modules/organization/application/organization.facade';
import { CreateOrganizationDto } from 'src/bff/admin-api/endpoints/organizations/dto/create-organization.dto';
import { UpdateOrganizationDto } from 'src/bff/admin-api/endpoints/organizations/dto/update-organization.dto';
import { AddMemberToOrganizationDto } from 'src/bff/admin-api/endpoints/organizations/dto/add-member-to-organization.dto';
import { RemoveMemberFromOrganizationQueryParamsDto } from 'src/bff/admin-api/endpoints/organizations/dto/remove-member-from-organization-query-params.dto';
import { GetOrganizationListQueryParamsDto } from 'src/bff/admin-api/endpoints/organizations/dto/get-organization-list-query-params.dto';
import { DEFAULT_PAGE_SIZE } from 'src/bff/admin-api/constants';

@ApiBearerAuth('admin-auth')
@ApiTags('Admin - Organizations')
@Controller('admin/organizations')
export class OrganizationsController {
  constructor(private readonly organizationFacade: OrganizationFacade) {}

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
    const data = await this.organizationFacade.getOrganizationListForAdmin(
      queryParams.page ?? 1,
      queryParams.limit ?? DEFAULT_PAGE_SIZE,
      queryParams.search,
    );
    const total =
      await this.organizationFacade.getOrganizationListForAdminTotal(
        queryParams.search,
      );

    return { data, total, currentPage: queryParams.page ?? 1 };
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
    const id = await this.organizationFacade.createOrganization(
      dto.name,
      dto.address,
      dto.taxId,
    );
    return { id };
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
    const id = await this.organizationFacade.updateOrganization(
      organizationId,
      dto.name,
      dto.address,
      dto.taxId,
      dto.version,
    );
    return { id };
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
    const id = await this.organizationFacade.addMember(
      organizationId,
      dto.organizationUserId,
      dto.isRoot,
      dto.version,
    );
    return { id };
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
    const id = await this.organizationFacade.removeMember(
      organizationId,
      memberId,
      queryParams.version,
    );
    return { id };
  }
}
