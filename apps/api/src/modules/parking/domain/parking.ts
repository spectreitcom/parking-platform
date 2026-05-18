import { AggregateRoot } from '@nestjs/cqrs';
import { ParkingId } from './value-objects/parking-id';
import { ParkingName } from './value-objects/parking-name';
import { Address } from './value-objects/address';
import { Coords } from 'src/shared/value-objects/coords';
import { AssetId } from './value-objects/asset-id';
import { ParkingFeatureId } from './value-objects/parking-feature-id';
import { AggregateVersion } from 'src/shared/value-objects/aggregate-version';
import { OrganizationId } from './value-objects/organization-id';
import { ParkingAddonId } from './value-objects/parking-addon-id';
import { ParkingCreatedEvent } from './events/parking-created.event';
import { PlaceId } from './value-objects/place-id';
import { ParkingUpdatedEvent } from './events/parking-updated.event';
import { ParkingActivatedEvent } from './events/parking-activated.event';
import { ParkingDeactivatedEvent } from './events/parking-deactivated.event';

export class Parking extends AggregateRoot {
  private readonly id: ParkingId;
  private organizationId: OrganizationId;
  private name: ParkingName;
  private description?: string;
  private active: boolean;
  private address: Address;
  private coords: Coords;
  private assetIds: AssetId[];
  private statute?: string;
  private parkingFeatureIds: ParkingFeatureId[];
  private version: AggregateVersion;
  private parkingAddonIds: ParkingAddonId[];
  private placeId: PlaceId;
  private readonly createdAt: Date;
  private updatedAt: Date;

  private constructor(
    id: ParkingId,
    organizationId: OrganizationId,
    name: ParkingName,
    active: boolean,
    address: Address,
    coords: Coords,
    assetIds: readonly AssetId[],
    parkingFeatureIds: readonly ParkingFeatureId[],
    parkingAddonIds: readonly ParkingAddonId[],
    placeId: PlaceId,
    version: AggregateVersion,
    createdAt: Date,
    updatedAt: Date,
    description?: string,
    statute?: string,
  ) {
    super();
    this.id = id;
    this.organizationId = organizationId;
    this.name = name;
    this.description = description;
    this.active = active;
    this.address = address;
    this.coords = coords;
    this.assetIds = [...assetIds];
    this.statute = statute;
    this.parkingFeatureIds = [...parkingFeatureIds];
    this.parkingAddonIds = [...parkingAddonIds];
    this.placeId = placeId;
    this.version = version;
    this.createdAt = new Date(createdAt);
    this.updatedAt = new Date(updatedAt);
  }

  static reconstruct(
    id: ParkingId,
    organizationId: OrganizationId,
    name: ParkingName,
    active: boolean,
    address: Address,
    coords: Coords,
    assetIds: readonly AssetId[],
    parkingFeatureIds: readonly ParkingFeatureId[],
    parkingAddonIds: readonly ParkingAddonId[],
    placeId: PlaceId,
    version: AggregateVersion,
    createdAt: Date,
    updatedAt: Date,
    description?: string,
    statute?: string,
  ) {
    return new Parking(
      id,
      organizationId,
      name,
      active,
      address,
      coords,
      assetIds,
      parkingFeatureIds,
      parkingAddonIds,
      placeId,
      version,
      createdAt,
      updatedAt,
      description,
      statute,
    );
  }

  static create(
    organizationId: string,
    name: string,
    address: string,
    coords: { longitude: number; latitude: number },
    placeId: string,
    id?: string,
  ) {
    const _id = id ? ParkingId.fromString(id) : ParkingId.create();
    const _organizationId = OrganizationId.fromString(organizationId);
    const _name = ParkingName.fromString(name);
    const _address = Address.fromString(address);
    const _coords = Coords.fromNumbers(coords.latitude, coords.longitude);
    const _placeId = PlaceId.fromString(placeId);
    const createdAt = new Date();
    const updatedAt = new Date();
    const parking = new Parking(
      _id,
      _organizationId,
      _name,
      true,
      _address,
      _coords,
      [],
      [],
      [],
      _placeId,
      AggregateVersion.one(),
      createdAt,
      updatedAt,
      '',
      '',
    );

    parking.apply(
      new ParkingCreatedEvent(
        _id.value,
        _organizationId.value,
        _placeId.value,
        _name.value,
        _address.value,
        _coords.latitude,
        _coords.longitude,
        [],
        [],
        parking.active,
        [],
        '',
        '',
        parking.version.value,
        createdAt,
        updatedAt,
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
    placeId: string,
    organizationId: string,
    description?: string,
    statute?: string,
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
    this.placeId = PlaceId.fromString(placeId);
    this.organizationId = OrganizationId.fromString(organizationId);
    this.description = description;
    this.statute = statute;
    this.version = this.version.increment();
    this.updatedAt = new Date();
    const _nextVersion = this.version;

    this.apply(
      new ParkingUpdatedEvent(
        this.id.value,
        this.organizationId.value,
        this.placeId.value,
        this.name.value,
        this.address.value,
        this.coords.latitude,
        this.coords.longitude,
        this.parkingFeatureIds.map((id) => id.value),
        this.parkingAddonIds.map((id) => id.value),
        this.active,
        this.assetIds.map((id) => id.value),
        this.description ?? '',
        this.statute ?? '',
        _nextVersion.value,
        this.createdAt,
        this.updatedAt,
      ),
    );
  }

  activate() {
    if (this.active) {
      return;
    }
    this.active = true;
    this.version = this.version.increment();
    this.updatedAt = new Date();
    const _nextVersion = this.version;
    this.apply(
      new ParkingActivatedEvent(
        this.id.value,
        _nextVersion.value,
        this.updatedAt,
      ),
    );
  }

  deactivate() {
    if (!this.active) {
      return;
    }
    this.active = false;
    this.version = this.version.increment();
    this.updatedAt = new Date();
    const _nextVersion = this.version;
    this.apply(
      new ParkingDeactivatedEvent(
        this.id.value,
        _nextVersion.value,
        this.updatedAt,
      ),
    );
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

  getStatute() {
    return this.statute;
  }

  getParkingFeatureIds() {
    return [...this.parkingFeatureIds];
  }

  getVersion() {
    return this.version;
  }

  getOrganizationId() {
    return this.organizationId;
  }

  getParkingAddonIds() {
    return [...this.parkingAddonIds];
  }

  getPlaceId() {
    return this.placeId;
  }

  getCreatedAt() {
    return new Date(this.createdAt);
  }

  getUpdatedAt() {
    return new Date(this.updatedAt);
  }
}
