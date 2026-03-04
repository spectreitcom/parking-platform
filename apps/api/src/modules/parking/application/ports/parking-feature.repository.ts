import { ParkingFeature } from '../../domain/parking-feature';
import { PrismaTx } from '../../../../shared/prisma/types';
import { RepositorySaveOptions } from '../../../../shared/types';

export abstract class ParkingFeatureRepository {
  abstract save(
    parkingFeature: ParkingFeature,
    options?: RepositorySaveOptions,
  ): Promise<void>;
  abstract findById(id: string, tx?: PrismaTx): Promise<ParkingFeature | null>;
  abstract delete(id: string, version: number, tx?: PrismaTx): Promise<void>;
}
