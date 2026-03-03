import { AggregateRoot } from '@nestjs/cqrs';
import { ParkingId } from './value-objects/parking-id';
import { ParkingName } from './value-objects/parking-name';
import { Address } from './value-objects/address';
import { Coords } from './value-objects/coords';
import { AssetId } from './value-objects/asset-id';
import { ParkingFeatureId } from './value-objects/parking-feature-id';
import { AggregateVersion } from '../../../shared/value-objects/aggregate-version';
import { OwnerId } from './value-objects/owner-id';
import { ParkingAddonId } from './value-objects/parking-addon-id';
import { ParkingCreatedEvent } from './events/parking-created.event';
import { PlaceId } from './value-objects/place-id';
import { ParkingUpdatedEvent } from './events/parking-updated.event';
import { ParkingActivatedEvent } from './events/parking-activated.event';
import { ParkingDeactivatedEvent } from './events/parking-deactivated.event';

export class Parking extends AggregateRoot {
  private readonly id: ParkingId;
  private readonly ownerId: OwnerId;
  private name: ParkingName;
  private description?: string;
  private active: boolean;
  private address: Address;
  private coords: Coords;
  private assetIds: AssetId[];
  private statue?: string;
  private parkingFeatureIds: ParkingFeatureId[];
  private readonly version: AggregateVersion;
  private parkingAddonIds: ParkingAddonId[];
  private readonly placeId: PlaceId;

  constructor(
    id: ParkingId,
    ownerId: OwnerId,
    name: ParkingName,
    active: boolean,
    address: Address,
    coords: Coords,
    assetIds: readonly AssetId[],
    parkingFeatureIds: readonly ParkingFeatureId[],
    parkingAddonIds: readonly ParkingAddonId[],
    placeId: PlaceId,
    version: AggregateVersion,
    description?: string,
    statue?: string,
  ) {
    super();
    this.id = id;
    this.ownerId = ownerId;
    this.name = name;
    this.description = description;
    this.active = active;
    this.address = address;
    this.coords = coords;
    this.assetIds = [...assetIds];
    this.statue = statue;
    this.parkingFeatureIds = [...parkingFeatureIds];
    this.parkingAddonIds = [...parkingAddonIds];
    this.placeId = placeId;
    this.version = version;
  }

  static create(
    ownerId: string,
    name: string,
    address: string,
    coords: { longitude: number; latitude: number },
    placeId: string,
  ) {
    const id = ParkingId.create();
    const _ownerId = OwnerId.fromString(ownerId);
    const _name = ParkingName.fromString(name);
    const _address = Address.fromString(address);
    const _coords = Coords.fromNumbers(coords.latitude, coords.longitude);
    const _placeId = PlaceId.fromString(placeId);
    const parking = new Parking(
      id,
      _ownerId,
      _name,
      true,
      _address,
      _coords,
      [],
      [],
      [],
      _placeId,
      AggregateVersion.one(),
    );

    parking.apply(
      new ParkingCreatedEvent(
        id.value,
        _ownerId.value,
        _placeId.value,
        _name.value,
        _address.value,
        _coords.latitude,
        _coords.longitude,
        [],
        [],
        false,
        [],
      ),
    );

    return parking;
  }

  update(
    name: string,
    address: string,
    coords: { longitude: number; latitude: number },
    assetIds: readonly string[],
    parkingFeatureIds: readonly string[],
    parkingAddonIds: readonly string[],
    description?: string,
    statue?: string,
  ) {
    this.name = ParkingName.fromString(name);
    this.address = Address.fromString(address);
    this.coords = Coords.fromNumbers(coords.latitude, coords.longitude);
    this.assetIds = assetIds.map((id) => AssetId.fromString(id));
    this.parkingFeatureIds = parkingFeatureIds.map((id) =>
      ParkingFeatureId.fromString(id),
    );
    this.parkingAddonIds = parkingAddonIds.map((id) =>
      ParkingAddonId.fromString(id),
    );
    this.description = description;
    this.statue = statue;

    this.apply(
      new ParkingUpdatedEvent(
        this.id.value,
        this.ownerId.value,
        this.placeId.value,
        this.name.value,
        this.address.value,
        this.coords.latitude,
        this.coords.longitude,
        this.parkingFeatureIds.map((id) => id.value),
        this.parkingAddonIds.map((id) => id.value),
        this.active,
        this.assetIds.map((id) => id.value),
      ),
    );
  }

  activate() {
    if (this.active) {
      return;
    }
    this.active = true;
    this.apply(new ParkingActivatedEvent(this.id.value));
  }

  deactivate() {
    if (!this.active) {
      return;
    }
    this.active = false;
    this.apply(new ParkingDeactivatedEvent(this.id.value));
  }

  getId() {
    return this.id;
  }

  getName() {
    return this.name;
  }

  getDescription() {
    return this.description;
  }

  isActive() {
    return this.active;
  }

  getAddress() {
    return this.address;
  }

  getCoords() {
    return this.coords;
  }

  getAssetIds() {
    return [...this.assetIds];
  }

  getStatue() {
    return this.statue;
  }

  getParkingFeatureIds() {
    return [...this.parkingFeatureIds];
  }

  getVersion() {
    return this.version;
  }

  getOwnerId() {
    return this.ownerId;
  }

  getParkingAddonIds() {
    return [...this.parkingAddonIds];
  }

  getPlaceId() {
    return this.placeId;
  }
}
