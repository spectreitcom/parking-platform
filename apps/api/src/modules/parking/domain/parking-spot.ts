import { AggregateRoot } from '@nestjs/cqrs';
import { ParkingSpotId } from './value-objects/parking-spot-id';
import { ParkingId } from './value-objects/parking-id';
import { Money } from './value-objects/money';
import { ParkingFeatureId } from './value-objects/parking-feature-id';
import { AggregateVersion } from '../../../shared/value-objects/aggregate-version';
import { ParkingSpotCreatedEvent } from './events/parking-spot-created.event';
import { ParkingSpotUpdatedEvent } from './events/parking-spot-updated.event';
import { ParkingSpotActivatedEvent } from './events/parking-spot-activated.event';
import { ParkingSpotDeactivatedEvent } from './events/parking-spot-deactivated.event';

export class ParkingSpot extends AggregateRoot {
  private readonly id: ParkingSpotId;
  private readonly parkingId: ParkingId;
  private price: Money;
  private active: boolean;
  private parkingSpotFeatureIds: ParkingFeatureId[];
  private readonly version: AggregateVersion;

  private constructor(
    id: ParkingSpotId,
    parkingId: ParkingId,
    price: Money,
    active: boolean,
    parkingSpotFeatureIds: readonly ParkingFeatureId[],
    version: AggregateVersion,
  ) {
    super();
    this.id = id;
    this.parkingId = parkingId;
    this.price = price;
    this.active = active;
    this.parkingSpotFeatureIds = [...parkingSpotFeatureIds];
    this.version = version;
  }

  static reconstruct(
    id: ParkingSpotId,
    parkingId: ParkingId,
    price: Money,
    active: boolean,
    parkingSpotFeatureIds: readonly ParkingFeatureId[],
    version: AggregateVersion,
  ) {
    return new ParkingSpot(
      id,
      parkingId,
      price,
      active,
      parkingSpotFeatureIds,
      version,
    );
  }

  static create(
    parkingId: string,
    price: number,
    parkingSpotFeatureIds: readonly string[],
  ) {
    const _parkingId = ParkingId.fromString(parkingId);
    const _price = Money.fromNumber(price);
    const _parkingSpotFeatureIds = parkingSpotFeatureIds.map((featureId) =>
      ParkingFeatureId.fromString(featureId),
    );

    const parkingSpot = new ParkingSpot(
      ParkingSpotId.create(),
      _parkingId,
      _price,
      true,
      _parkingSpotFeatureIds,
      AggregateVersion.one(),
    );

    parkingSpot.apply(
      new ParkingSpotCreatedEvent(
        parkingSpot.getId().value,
        parkingSpot.getParkingId().value,
        parkingSpot.getPrice().toPLN(),
        parkingSpot.isActive(),
        parkingSpot
          .getParkingSpotFeatureIds()
          .map((featureId) => featureId.value),
      ),
    );

    return parkingSpot;
  }

  update(price: number, parkingSpotFeatureIds: readonly string[]) {
    this.price = Money.fromNumber(price);
    this.parkingSpotFeatureIds = parkingSpotFeatureIds.map((featureId) =>
      ParkingFeatureId.fromString(featureId),
    );

    this.apply(
      new ParkingSpotUpdatedEvent(
        this.getId().value,
        this.getParkingId().value,
        this.getPrice().toPLN(),
        this.isActive(),
        this.getParkingSpotFeatureIds().map((featureId) => featureId.value),
      ),
    );
  }

  activate() {
    if (this.active) {
      return;
    }
    this.active = true;
    this.apply(new ParkingSpotActivatedEvent(this.id.value));
  }

  deactivate() {
    if (!this.active) {
      return;
    }
    this.active = false;
    this.apply(new ParkingSpotDeactivatedEvent(this.id.value));
  }

  getId() {
    return this.id;
  }

  getParkingId() {
    return this.parkingId;
  }

  getPrice() {
    return this.price;
  }

  getParkingSpotFeatureIds() {
    return [...this.parkingSpotFeatureIds];
  }

  getVersion() {
    return this.version;
  }

  isActive() {
    return this.active;
  }
}
