import { Place } from '../../domain/place';
import { PrismaTx } from '../../../../shared/prisma/types';

export abstract class PlaceRepository {
  abstract save(place: Place, tx?: PrismaTx): Promise<void>;
  abstract findById(id: string, tx?: PrismaTx): Promise<Place | null>;
}
