import { Place } from '../../domain/place';
import { PlaceId } from '../../domain/value-objects/place-id';
import { PlaceName } from '../../domain/value-objects/place-name';
import { Coords } from '../../domain/value-objects/coords';
import { Address } from '../../domain/value-objects/address';
import { PlaceTypeId } from '../../domain/value-objects/place-type-id';
import { AggregateVersion } from '../../../../shared/value-objects/aggregate-version';
import { Place as PlaceModel } from '@prisma/client';

export class PlaceMapper {
  static toDomain(raw: PlaceModel): Place {
    return Place.reconstruct(
      PlaceId.fromString(raw.id),
      PlaceName.fromString(raw.name),
      Coords.fromNumbers(Number(raw.latitude), Number(raw.longitude)),
      Address.fromString(raw.address),
      raw.active,
      PlaceTypeId.fromString(raw.placeTypeId),
      AggregateVersion.fromNumber(raw.version),
    );
  }

  static toPersistence(place: Place) {
    return {
      id: place.getId().value,
      name: place.getName().value,
      latitude: place.getCoords().latitude,
      longitude: place.getCoords().longitude,
      address: place.getAddress().value,
      active: place.isActive(),
      placeTypeId: place.getPlaceTypeId().value,
      version: place.getVersion().value,
    };
  }
}
