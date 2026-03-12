import { ParkingSpot } from '../../domain/parking-spot';
import { ParkingSpotId } from '../../domain/value-objects/parking-spot-id';
import { ParkingId } from '../../domain/value-objects/parking-id';
import { Money } from '../../domain/value-objects/money';
import { ParkingFeatureId } from '../../domain/value-objects/parking-feature-id';
import { AggregateVersion } from '../../../../shared/value-objects/aggregate-version';
import {
  ParkingSpot as ParkingSpotModel,
  ParkingFeature,
} from '@prisma/client';

export class ParkingSpotMapper {
  static toDomain(
    raw: ParkingSpotModel & { parkingSpotFeatures: ParkingFeature[] },
  ): ParkingSpot {
    return ParkingSpot.reconstruct(
      ParkingSpotId.fromString(raw.id),
      ParkingId.fromString(raw.parkingId),
      Money.fromNumber(Number(raw.price)),
      raw.active,
      raw.parkingSpotFeatures.map((f: { id: string }) =>
        ParkingFeatureId.fromString(f.id),
      ),
      AggregateVersion.fromNumber(raw.version),
    );
  }

  static toPersistence(parkingSpot: ParkingSpot) {
    return {
      id: parkingSpot.getId().value,
      parkingId: parkingSpot.getParkingId().value,
      price: parkingSpot.getPrice().value,
      active: parkingSpot.isActive(),
      parkingSpotFeatures: parkingSpot
        .getParkingSpotFeatureIds()
        .map((id) => ({ id: id.value })),
      version: parkingSpot.getVersion().value,
    };
  }
}
