import { CartAddonRaw } from '../../types';

export class CartReadModel {
  constructor(
    public readonly id: string,
    public readonly parkingSpotId: string,
    public readonly arrival: number,
    public readonly departure: number,
    public readonly pricePerDay: number,
    public readonly addons: CartAddonRaw[],
    public readonly createdAt: Date,
    public readonly total: number,
    public readonly days: number,
    public readonly userId?: string,
  ) {}
}
