import { Parking } from '../../domain/parking';
import { PrismaTx } from 'src/shared/prisma/types';
import { RepositorySaveOptions } from 'src/shared/types';

export abstract class ParkingRepository {
  abstract save(
    parking: Parking,
    options?: RepositorySaveOptions,
  ): Promise<void>;
  abstract findById(id: string, tx?: PrismaTx): Promise<Parking | null>;
}
