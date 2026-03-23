import { AggregateRoot } from '@nestjs/cqrs';
import { ParkingFeatureId } from './value-objects/parking-feature-id';
import { ParkingFeatureName } from './value-objects/parking-feature-name';
import { ParkingFeatureLevel } from './value-objects/parking-feature-level';
import { AggregateVersion } from '../../../shared/value-objects/aggregate-version';
import { ParkingFeatureCreatedEvent } from './events/parking-feature-created.event';
import { ParkingFeatureUpdatedEvent } from './events/parking-feature-updated.event';
import { ParkingFeatureDeletedEvent } from './events/parking-feature-deleted.event';

export class ParkingFeature extends AggregateRoot {
  private readonly id: ParkingFeatureId;
  private name: ParkingFeatureName;
  private levels: ParkingFeatureLevel[];
  private readonly version: AggregateVersion;

  private constructor(
    id: ParkingFeatureId,
    name: ParkingFeatureName,
    levels: readonly ParkingFeatureLevel[],
    version: AggregateVersion,
  ) {
    super();
    this.id = id;
    this.name = name;
    this.levels = [...levels];
    this.version = version;
  }

  static reconstruct(
    id: ParkingFeatureId,
    name: ParkingFeatureName,
    levels: readonly ParkingFeatureLevel[],
    version: AggregateVersion,
  ) {
    return new ParkingFeature(id, name, levels, version);
  }

  static create(name: string, levels: string[]) {
    const id = ParkingFeatureId.create();
    const _name = ParkingFeatureName.fromString(name);
    const _levels = ParkingFeatureLevel.fromArray(levels);
    const _version = AggregateVersion.one();

    const parkingFeature = new ParkingFeature(id, _name, _levels, _version);

    parkingFeature.apply(
      new ParkingFeatureCreatedEvent(
        id.value,
        _name.value,
        _levels.map((level) => level.value),
        _version.value,
      ),
    );

    return parkingFeature;
  }

  update(name: string, levels: string[]) {
    this.name = ParkingFeatureName.fromString(name);
    this.levels = ParkingFeatureLevel.fromArray(levels);
    this.apply(
      new ParkingFeatureUpdatedEvent(
        this.id.value,
        this.name.value,
        this.levels.map((level) => level.value),
        this.version.value,
      ),
    );
  }

  delete() {
    this.apply(new ParkingFeatureDeletedEvent(this.id.value));
  }

  getId() {
    return this.id;
  }

  getName() {
    return this.name;
  }

  getLevels() {
    return [...this.levels];
  }

  getVersion() {
    return this.version;
  }
}
