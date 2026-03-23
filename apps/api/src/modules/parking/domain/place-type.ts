import { AggregateRoot } from '@nestjs/cqrs';
import { PlaceTypeId } from './value-objects/place-type-id';
import { PlaceTypeName } from './value-objects/place-type-name';
import { PlaceTypeCreatedEvent } from './events/place-type-created.event';
import { PlaceTypeUpdatedEvent } from './events/place-type-updated.event';
import { PlaceTypeDeletedEvent } from './events/place-type-deleted.event';
import { AggregateVersion } from '../../../shared/value-objects/aggregate-version';

export class PlaceType extends AggregateRoot {
  private readonly id: PlaceTypeId;
  private name: PlaceTypeName;
  private version: AggregateVersion;

  private constructor(
    id: PlaceTypeId,
    name: PlaceTypeName,
    version: AggregateVersion,
  ) {
    super();
    this.id = id;
    this.name = name;
    this.version = version;
  }

  static reconstruct(
    id: PlaceTypeId,
    name: PlaceTypeName,
    version: AggregateVersion,
  ) {
    return new PlaceType(id, name, version);
  }

  static create(name: string) {
    const id = PlaceTypeId.create();
    const _name = PlaceTypeName.fromString(name);
    const _version = AggregateVersion.one();
    const placeType = new PlaceType(id, _name, _version);
    placeType.apply(
      new PlaceTypeCreatedEvent(id.value, _name.value, _version.value),
    );
    return placeType;
  }

  update(name: string) {
    this.name = PlaceTypeName.fromString(name);
    const nextVersion = this.version.increment();
    this.version = nextVersion;
    this.apply(
      new PlaceTypeUpdatedEvent(
        this.id.value,
        this.name.value,
        nextVersion.value,
      ),
    );
  }

  delete() {
    this.apply(new PlaceTypeDeletedEvent(this.id.value));
  }

  getId() {
    return this.id;
  }

  getName() {
    return this.name;
  }

  getVersion() {
    return this.version;
  }
}
