import { AggregateRoot } from '@nestjs/cqrs';
import { PlaceId } from './value-objects/place-id';
import { PlaceTypeId } from './value-objects/place-type-id';
import { PlaceName } from './value-objects/place-name';
import { Coords } from './value-objects/coords';
import { Address } from './value-objects/address';
import { PlaceCreatedEvent } from './events/place-created.event';
import { PlaceActivatedEvent } from './events/place-activated.event';
import { PlaceDeactivatedEvent } from './events/place-deactivated.event';
import { PlaceUpdatedEvent } from './events/place-updated.event';
import { AggregateVersion } from '../../../shared/value-objects/aggregate-version';

export class Place extends AggregateRoot {
  private readonly id: PlaceId;
  private name: PlaceName;
  private coords: Coords;
  private address: Address;
  private active: boolean;
  private placeTypeId: PlaceTypeId;
  private readonly version: AggregateVersion;

  constructor(
    id: PlaceId,
    name: PlaceName,
    coords: Coords,
    address: Address,
    active: boolean,
    placeTypeId: PlaceTypeId,
    version: AggregateVersion,
  ) {
    super();
    this.id = id;
    this.name = name;
    this.coords = coords;
    this.address = address;
    this.active = active;
    this.placeTypeId = placeTypeId;
    this.version = version;
  }

  static create(
    name: string,
    coordsObject: { longitude: number; latitude: number },
    address: string,
    active: boolean,
    placeTypeId: string,
  ) {
    const place = new Place(
      PlaceId.create(),
      PlaceName.fromString(name),
      Coords.fromNumbers(coordsObject.latitude, coordsObject.longitude),
      Address.fromString(address),
      active,
      PlaceTypeId.fromString(placeTypeId),
      AggregateVersion.one(),
    );

    place.apply(
      new PlaceCreatedEvent(
        place.getId().value,
        place.getName().value,
        place.getCoords().latitude,
        place.getCoords().longitude,
        place.getPlaceTypeId().value,
        place.isActive(),
        place.getAddress().value,
      ),
    );

    return place;
  }

  deactivate() {
    if (!this.active) {
      return;
    }
    this.active = false;
    this.apply(new PlaceDeactivatedEvent(this.id.value));
  }

  activate() {
    if (this.active) {
      return;
    }
    this.active = true;
    this.apply(new PlaceActivatedEvent(this.id.value));
  }

  update(
    name: string,
    coordsObject: { longitude: number; latitude: number },
    address: string,
    placeTypeId: string,
  ) {
    this.name = PlaceName.fromString(name);
    this.coords = Coords.fromNumbers(
      coordsObject.latitude,
      coordsObject.longitude,
    );
    this.address = Address.fromString(address);
    this.placeTypeId = PlaceTypeId.fromString(placeTypeId);

    this.apply(
      new PlaceUpdatedEvent(
        this.id.value,
        this.name.value,
        this.coords.latitude,
        this.coords.longitude,
        this.placeTypeId.value,
        this.active,
        this.address.value,
      ),
    );
  }

  getId() {
    return this.id;
  }

  getName() {
    return this.name;
  }

  getCoords() {
    return this.coords;
  }

  getAddress() {
    return this.address;
  }

  isActive() {
    return this.active;
  }

  getPlaceTypeId() {
    return this.placeTypeId;
  }

  getVersion() {
    return this.version;
  }
}
