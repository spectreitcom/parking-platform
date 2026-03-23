import { AggregateRoot } from '@nestjs/cqrs';
import { ParkingAddonId } from './value-objects/parking-addon-id';
import { ParkingAddonName } from './value-objects/parking-addon-name';
import { ParkingAddonCode } from './value-objects/parking-addon-code';
import { ParkingAddonCreatedEvent } from './events/parking-addon-created.event';
import { Money } from '../../../shared/value-objects/money';
import { ParkingAddonUpdatedEvent } from './events/parking-addon-updated.event';
import { ParkingAddonDeletedEvent } from './events/parking-addon-deleted.event';
import { AggregateVersion } from '../../../shared/value-objects/aggregate-version';

export class ParkingAddon extends AggregateRoot {
  private readonly id: ParkingAddonId;
  private readonly code: ParkingAddonCode;
  private name: ParkingAddonName;
  private price: Money;
  private version: AggregateVersion;

  private constructor(
    id: ParkingAddonId,
    code: ParkingAddonCode,
    name: ParkingAddonName,
    price: Money,
    version: AggregateVersion,
  ) {
    super();
    this.id = id;
    this.code = code;
    this.name = name;
    this.price = price;
    this.version = version;
  }

  static reconstruct(
    id: ParkingAddonId,
    code: ParkingAddonCode,
    name: ParkingAddonName,
    price: Money,
    version: AggregateVersion,
  ) {
    return new ParkingAddon(id, code, name, price, version);
  }

  static create(code: string, name: string, price: number) {
    const id = ParkingAddonId.create();
    const _code = ParkingAddonCode.fromString(code);
    const _name = ParkingAddonName.fromString(name);
    const _price = Money.fromNumber(price);
    const _version = AggregateVersion.one();

    const parkingAddon = new ParkingAddon(id, _code, _name, _price, _version);
    parkingAddon.apply(
      new ParkingAddonCreatedEvent(
        id.value,
        _code.value,
        _name.value,
        _price.value,
        _version.value,
      ),
    );
    return parkingAddon;
  }

  update(name: string, price: number) {
    this.name = ParkingAddonName.fromString(name);
    this.price = Money.fromNumber(price);
    const nextVersion = this.version.increment();
    this.version = nextVersion;

    this.apply(
      new ParkingAddonUpdatedEvent(
        this.id.value,
        this.code.value,
        this.name.value,
        this.price.value,
        nextVersion.value,
      ),
    );
  }

  delete() {
    this.apply(new ParkingAddonDeletedEvent(this.id.value));
  }

  getId() {
    return this.id;
  }

  getCode() {
    return this.code;
  }

  getName() {
    return this.name;
  }

  getPrice() {
    return this.price;
  }

  getVersion() {
    return this.version;
  }
}
