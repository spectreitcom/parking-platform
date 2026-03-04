import { ParkingSpot } from '../../domain/parking-spot';
import { PrismaTx } from '../../../../shared/prisma/types';

export abstract class ParkingSpotRepository {
  abstract save(
    parkingSpot: ParkingSpot,
    options?: { isNew?: boolean; tx?: PrismaTx },
  ): Promise<void>;
  abstract findById(id: string, tx?: PrismaTx): Promise<ParkingSpot | null>;
}
