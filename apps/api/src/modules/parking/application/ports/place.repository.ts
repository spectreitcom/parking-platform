import { Place } from '../../domain/place';
import { PrismaTx } from '../../../../shared/prisma/types';
import { RepositorySaveOptions } from '../../../../shared/types';

export abstract class PlaceRepository {
  abstract save(place: Place, options?: RepositorySaveOptions): Promise<void>;
  abstract findById(id: string, tx?: PrismaTx): Promise<Place | null>;
}
