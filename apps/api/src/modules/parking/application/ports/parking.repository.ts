import { Parking } from '../../domain/parking';
import { PrismaTx } from '../../../../shared/prisma/types';

export abstract class ParkingRepository {
  abstract save(parking: Parking, tx?: PrismaTx): Promise<void>;
  abstract findById(id: string, tx?: PrismaTx): Promise<Parking | null>;
}
