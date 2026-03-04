import { Parking } from '../../domain/parking';
import { PrismaTx } from '../../../../shared/prisma/types';
import { RepositorySaveOptions } from '../../../../shared/types';

export abstract class ParkingRepository {
  abstract save(
    parking: Parking,
    options?: RepositorySaveOptions,
  ): Promise<void>;
  abstract findById(id: string, tx?: PrismaTx): Promise<Parking | null>;
}
