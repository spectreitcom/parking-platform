import { ParkingAddon } from '../../domain/parking-addon';
import { PrismaTx } from '../../../../shared/prisma/types';

export abstract class ParkingAddonRepository {
  abstract save(parkingAddon: ParkingAddon, tx?: PrismaTx): Promise<void>;
  abstract findById(id: string, tx?: PrismaTx): Promise<ParkingAddon | null>;
  abstract findByCode(
    code: string,
    tx?: PrismaTx,
  ): Promise<ParkingAddon | null>;
  abstract delete(id: string, version: number, tx?: PrismaTx): Promise<void>;
}
