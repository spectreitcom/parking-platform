import { Parking } from '../../domain/parking';
import { ParkingId } from '../../domain/value-objects/parking-id';
import { OrganizationId } from '../../domain/value-objects/organization-id';
import { ParkingName } from '../../domain/value-objects/parking-name';
import { Address } from '../../domain/value-objects/address';
import { Coords } from '../../../../shared/value-objects/coords';
import { AssetId } from '../../domain/value-objects/asset-id';
import { ParkingFeatureId } from '../../domain/value-objects/parking-feature-id';
import { ParkingAddonId } from '../../domain/value-objects/parking-addon-id';
import { PlaceId } from '../../domain/value-objects/place-id';
import { AggregateVersion } from '../../../../shared/value-objects/aggregate-version';
import {
  Parking as ParkingModel,
  ParkingAddon,
  ParkingFeature,
} from '@prisma/client';

export class ParkingMapper {
  static toDomain(
    raw: ParkingModel & {
      parkingAddons: ParkingAddon[];
      parkingFeatures: ParkingFeature[];
    },
  ): Parking {
    return Parking.reconstruct(
      ParkingId.fromString(raw.id),
      OrganizationId.fromString(raw.organizationId),
      ParkingName.fromString(raw.name),
      raw.active,
      Address.fromString(raw.address),
      Coords.fromNumbers(Number(raw.latitude), Number(raw.longitude)),
      raw.assetIds.map((assetId: string) => AssetId.fromString(assetId)),
      raw.parkingFeatures.map((f: { id: string }) =>
        ParkingFeatureId.fromString(f.id),
      ),
      raw.parkingAddons.map((a: { id: string }) =>
        ParkingAddonId.fromString(a.id),
      ),
      PlaceId.fromString(raw.placeId),
      AggregateVersion.fromNumber(raw.version),
      raw.description ?? undefined,
      raw.statute ?? undefined,
    );
  }

  static toPersistence(parking: Parking) {
    return {
      id: parking.getId().value,
      name: parking.getName().value,
      description: parking.getDescription(),
      active: parking.isActive(),
      address: parking.getAddress().value,
      latitude: parking.getCoords().latitude,
      longitude: parking.getCoords().longitude,
      organizationId: parking.getOrganizationId().value,
      placeId: parking.getPlaceId().value,
      statute: parking.getStatute(),
      assetIds: parking.getAssetIds().map((id) => id.value),
      version: parking.getVersion().value,
      parkingFeatures: parking
        .getParkingFeatureIds()
        .map((id) => ({ id: id.value })),
      parkingAddons: parking
        .getParkingAddonIds()
        .map((id) => ({ id: id.value })),
    };
  }
}
