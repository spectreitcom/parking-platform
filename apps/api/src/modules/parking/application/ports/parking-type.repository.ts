import { ParkingType } from '../../domain/parking-type';
import { PrismaTx } from '../../../../shared/prisma/types';

export abstract class ParkingTypeRepository {
  abstract save(parkingType: ParkingType, tx?: PrismaTx): Promise<void>;
  abstract findById(id: string, tx?: PrismaTx): Promise<ParkingType | null>;
  abstract delete(id: string, tx?: PrismaTx): Promise<void>;
}
