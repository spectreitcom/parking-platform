import { ParkingSpot } from '../../domain/parking-spot';
import { PrismaTx } from '../../../../shared/prisma/types';
import { RepositorySaveOptions } from '../../../../shared/types';

export abstract class ParkingSpotRepository {
  abstract save(
    parkingSpot: ParkingSpot,
    options?: RepositorySaveOptions,
  ): Promise<void>;
  abstract findById(id: string, tx?: PrismaTx): Promise<ParkingSpot | null>;
}
