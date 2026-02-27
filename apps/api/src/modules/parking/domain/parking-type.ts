import { AggregateRoot } from '@nestjs/cqrs';
import { ParkingTypeId } from './value-objects/parking-type-id';
import { ParkingTypeName } from './value-objects/parking-type-name';
import { ParkingTypeCreatedEvent } from './events/parking-type-created.event';
import { ParkingTypeUpdatedEvent } from './events/parking-type-updated.event';
import { ParkingTypeDeletedEvent } from './events/parking-type-deleted.event';

export class ParkingType extends AggregateRoot {
  private readonly id: ParkingTypeId;
  private name: ParkingTypeName;

  constructor(id: ParkingTypeId, name: ParkingTypeName) {
    super();
    this.id = id;
    this.name = name;
  }

  static create(name: string) {
    const id = ParkingTypeId.create();
    const _name = ParkingTypeName.fromString(name);
    const parkingType = new ParkingType(id, _name);
    parkingType.apply(new ParkingTypeCreatedEvent(id.value, _name.value));
    return parkingType;
  }

  update(name: string) {
    this.name = ParkingTypeName.fromString(name);
    this.apply(new ParkingTypeUpdatedEvent(this.id.value, this.name.value));
  }

  delete() {
    this.apply(new ParkingTypeDeletedEvent(this.id.value));
  }

  getId() {
    return this.id;
  }

  getName() {
    return this.name;
  }
}
