import { AggregateRoot } from '@nestjs/cqrs';
import { PlaceTypeId } from './value-objects/place-type-id';
import { PlaceTypeName } from './value-objects/place-type-name';
import { PlaceTypeCreatedEvent } from './events/place-type-created.event';
import { PlaceTypeUpdatedEvent } from './events/place-type-updated.event';
import { PlaceTypeDeletedEvent } from './events/place-type-deleted.event';

export class PlaceType extends AggregateRoot {
  private readonly id: PlaceTypeId;
  private name: PlaceTypeName;

  constructor(id: PlaceTypeId, name: PlaceTypeName) {
    super();
    this.id = id;
    this.name = name;
  }

  static create(name: string) {
    const id = PlaceTypeId.create();
    const _name = PlaceTypeName.fromString(name);
    const placeType = new PlaceType(id, _name);
    placeType.apply(new PlaceTypeCreatedEvent(id.value, _name.value));
    return placeType;
  }

  update(name: string) {
    this.name = PlaceTypeName.fromString(name);
    this.apply(new PlaceTypeUpdatedEvent(this.id.value, this.name.value));
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
}
