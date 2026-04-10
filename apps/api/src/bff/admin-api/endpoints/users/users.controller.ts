import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserIamFacade } from 'src/modules/user-iam/application/user-iam.facade';
import { GetUsersListQueryParamsDto } from 'src/bff/admin-api/endpoints/users/dto/get-users-list-query-params.dto';
import { DEFAULT_PAGE_SIZE } from 'src/bff/admin-api/constants';

@ApiBearerAuth('admin-auth')
@ApiTags('Admin - Users')
@Controller('admin/users')
export class UsersController {
  constructor(private readonly userIamFacade: UserIamFacade) {}

  @ApiOperation({
    summary: 'Get users list',
  })
  @ApiOkResponse({
    description: 'The users list has been successfully retrieved.',
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
                description: 'The ID of the user',
                format: 'uuid',
              },
              email: {
                type: 'string',
                example: 'user@example.com',
              },
              name: {
                type: 'string',
                example: 'User Name',
              },
              provider: {
                type: 'string',
                example: 'credentials',
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
    description: 'Error retrieving users list due to validation errors.',
  })
  @Get()
  async getUsersList(@Query() queryParams: GetUsersListQueryParamsDto) {
    const data = await this.userIamFacade.getUsersList(
      queryParams.page ?? 1,
      queryParams.limit ?? DEFAULT_PAGE_SIZE,
      queryParams.search,
    );
    const total = await this.userIamFacade.getUsersTotal(queryParams.search);
    return { data, total, currentPage: queryParams.page ?? 1 };
  }

  @ApiOperation({
    summary: 'Get user by id',
  })
  @ApiOkResponse({
    description: 'The user has been successfully retrieved.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        email: { type: 'string' },
        name: { type: 'string' },
        provider: { type: 'string' },
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
    description: 'User not found',
  })
  @Get(':userId')
  async getUser(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return await this.userIamFacade.getUserById(userId);
  }
}
