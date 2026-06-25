import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/bff/api/auth/guards/jwt-auth.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUserId } from 'src/bff/api/auth/decorators/current-user-id.decorator';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { GetCartHandler } from './handlers/get-cart.handler';
import { CreateCartHandler } from './handlers/create-cart.handler';
import { UpdateCartHandler } from './handlers/update-cart.handler';

@UseGuards(JwtAuthGuard)
@ApiTags('Carts')
@ApiBearerAuth('auth')
@Controller('carts')
export class CartsController {
  constructor(
    private readonly getCartHandler: GetCartHandler,
    private readonly createCartHandler: CreateCartHandler,
    private readonly updateCartHandler: UpdateCartHandler,
  ) {}

  @ApiOperation({ summary: 'Get cart by id' })
  @ApiOkResponse({
    description: 'Returns the cart details',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        parkingSpotId: { type: 'string', format: 'uuid' },
        arrival: { type: 'number', description: 'Timestamp in milliseconds' },
        departure: { type: 'number', description: 'Timestamp in milliseconds' },
        pricePerDay: { type: 'number' },
        addons: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              price: { type: 'number' },
            },
          },
        },
        createdAt: { type: 'string', format: 'date-time' },
        total: { type: 'number' },
        days: { type: 'number' },
        userId: { type: 'string', format: 'uuid', nullable: true },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Get(':cartId')
  async getCart(
    @CurrentUserId() userId: string,
    @Param('cartId', new ParseUUIDPipe()) id: string,
  ) {
    return await this.getCartHandler.handle(id, userId);
  }

  @ApiOperation({ summary: 'Create a new cart' })
  @ApiCreatedResponse({
    description: 'The cart has been successfully created.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Post()
  async createCart(
    @CurrentUserId() userId: string,
    @Body() dto: CreateCartDto,
  ): Promise<{ id: string }> {
    return await this.createCartHandler.handle(userId, dto);
  }

  @ApiOperation({ summary: 'Update cart' })
  @ApiOkResponse({
    description: 'The cart has been successfully updated.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Patch(':cartId')
  async updateCart(
    @Param('cartId', new ParseUUIDPipe()) id: string,
    @CurrentUserId() userId: string,
    @Body() dto: UpdateCartDto,
  ): Promise<{ id: string }> {
    return await this.updateCartHandler.handle(id, userId, dto);
  }
}
