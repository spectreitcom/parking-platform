import { Place } from '../../domain/place';
import { PrismaTx } from 'src/shared/prisma/types';
import { RepositorySaveOptions } from 'src/shared/types';

export abstract class PlaceRepository {
  abstract save(place: Place, options?: RepositorySaveOptions): Promise<void>;
  abstract findById(id: string, tx?: PrismaTx): Promise<Place | null>;
}
