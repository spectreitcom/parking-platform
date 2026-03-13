import { ParkingFeature } from '../../domain/parking-feature';
import { ParkingFeatureId } from '../../domain/value-objects/parking-feature-id';
import { ParkingFeatureName } from '../../domain/value-objects/parking-feature-name';
import { ParkingFeatureLevel } from '../../domain/value-objects/parking-feature-level';
import { AggregateVersion } from '../../../../shared/value-objects/aggregate-version';
import { ParkingFeature as ParkingFeatureModel } from '@prisma/client';

export class ParkingFeatureMapper {
  static toDomain(raw: ParkingFeatureModel): ParkingFeature {
    return ParkingFeature.reconstruct(
      ParkingFeatureId.fromString(raw.id),
      ParkingFeatureName.fromString(raw.name),
      ParkingFeatureLevel.fromArray(raw.levels),
      AggregateVersion.fromNumber(raw.version),
    );
  }

  static toPersistence(parkingFeature: ParkingFeature) {
    return {
      id: parkingFeature.getId().value,
      name: parkingFeature.getName().value,
      levels: parkingFeature.getLevels().map((level) => level.value),
      version: parkingFeature.getVersion().value,
    };
  }
}
