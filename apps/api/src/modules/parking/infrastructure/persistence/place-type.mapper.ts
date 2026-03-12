import { PlaceType } from '../../domain/place-type';
import { PlaceTypeId } from '../../domain/value-objects/place-type-id';
import { PlaceTypeName } from '../../domain/value-objects/place-type-name';
import { AggregateVersion } from '../../../../shared/value-objects/aggregate-version';
import { PlaceType as PlaceTypeModel } from '@prisma/client';

export class PlaceTypeMapper {
  static toDomain(raw: PlaceTypeModel): PlaceType {
    return PlaceType.reconstruct(
      PlaceTypeId.fromString(raw.id),
      PlaceTypeName.fromString(raw.name),
      AggregateVersion.fromNumber(raw.version),
    );
  }

  static toPersistence(placeType: PlaceType) {
    return {
      id: placeType.getId().value,
      name: placeType.getName().value,
      version: placeType.getVersion().value,
    };
  }
}
