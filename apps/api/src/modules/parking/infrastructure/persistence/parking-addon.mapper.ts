import { ParkingAddon } from '../../domain/parking-addon';
import { ParkingAddonId } from '../../domain/value-objects/parking-addon-id';
import { ParkingAddonCode } from '../../domain/value-objects/parking-addon-code';
import { ParkingAddonName } from '../../domain/value-objects/parking-addon-name';
import { Money } from '../../domain/value-objects/money';
import { AggregateVersion } from '../../../../shared/value-objects/aggregate-version';
import { ParkingAddon as ParkingAddonModel } from '@prisma/client';

export class ParkingAddonMapper {
  static toDomain(raw: ParkingAddonModel): ParkingAddon {
    return ParkingAddon.reconstruct(
      ParkingAddonId.fromString(raw.id),
      ParkingAddonCode.fromString(raw.code),
      ParkingAddonName.fromString(raw.name),
      Money.fromNumber(Number(raw.price)),
      AggregateVersion.fromNumber(raw.version),
    );
  }

  static toPersistence(parkingAddon: ParkingAddon) {
    return {
      id: parkingAddon.getId().value,
      code: parkingAddon.getCode().value,
      name: parkingAddon.getName().value,
      price: parkingAddon.getPrice().value,
      version: parkingAddon.getVersion().value,
    };
  }
}
