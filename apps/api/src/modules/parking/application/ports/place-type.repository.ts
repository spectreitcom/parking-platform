import { PlaceType } from '../../domain/place-type';
import { PrismaTx } from '../../../../shared/prisma/types';

export abstract class PlaceTypeRepository {
  abstract save(
    placeType: PlaceType,
    options?: { isNew?: boolean; tx?: PrismaTx },
  ): Promise<void>;
  abstract findById(id: string, tx?: PrismaTx): Promise<PlaceType | null>;
  abstract delete(id: string, version: number, tx?: PrismaTx): Promise<void>;
}
