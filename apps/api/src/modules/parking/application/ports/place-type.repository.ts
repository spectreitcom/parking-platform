import { PlaceType } from '../../domain/place-type';
import { PrismaTx } from '../../../../shared/prisma/types';
import { RepositorySaveOptions } from '../../../../shared/types';

export abstract class PlaceTypeRepository {
  abstract save(
    placeType: PlaceType,
    options?: RepositorySaveOptions,
  ): Promise<void>;
  abstract findById(id: string, tx?: PrismaTx): Promise<PlaceType | null>;
  abstract delete(id: string, version: number, tx?: PrismaTx): Promise<void>;
}
