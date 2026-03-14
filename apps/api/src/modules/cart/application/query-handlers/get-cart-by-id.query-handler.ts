import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCartByIdQuery } from '../queries/get-cart-by-id.query';
import { CartReadModel } from './read-models/cart.read-model';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { AppError } from '../../../../shared/errors';
import { Money } from '../../../../shared/value-objects/money';
import { CartAddon } from '../../domain/entities/cart-addon';
import { CartAddonId } from '../../domain/value-objects/cart-addon-id';
import { CartAddonRaw } from '../types';

@QueryHandler(GetCartByIdQuery)
export class GetCartByIdQueryHandler implements IQueryHandler<
  GetCartByIdQuery,
  CartReadModel
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(query: GetCartByIdQuery): Promise<CartReadModel> {
    const { cartId, userId } = query;

    const record = await this.prismaService.cart.findUnique({
      where: {
        id: cartId,
        userId,
      },
    });

    if (!record) {
      throw new AppError('ENTITY_NOT_FOUND', 'Cart not found');
    }

    const {
      id,
      parkingSpotId,
      arrival,
      departure,
      addons,
      createdAt,
      total,
      days,
      userId: cartUserId,
      priceByDay,
    } = record;

    let _addons: CartAddon[] = [];

    if (Array.isArray(addons)) {
      _addons = (addons as CartAddonRaw[]).map((addon) => ({
        id: CartAddonId.fromString(addon.id),
        price: Money.fromNumber(addon.price),
      }));
    }

    return new CartReadModel(
      id,
      parkingSpotId,
      arrival,
      departure,
      priceByDay,
      _addons.map((addon) => ({
        id: addon.id.value,
        price: addon.price.toPLN(),
      })),
      createdAt,
      total,
      days,
      cartUserId ?? undefined,
    );
  }
}
