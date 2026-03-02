import { Place } from '../place';
import { PlaceCreatedEvent } from '../events/place-created.event';
import { PlaceActivatedEvent } from '../events/place-activated.event';
import { PlaceDeactivatedEvent } from '../events/place-deactivated.event';
import { PlaceUpdatedEvent } from '../events/place-updated.event';
import { randomUUID } from 'node:crypto';

describe('Place', () => {
  const defaultParams = {
    name: 'Parking Place 1',
    coords: { latitude: 52.2297, longitude: 21.0122 },
    address: 'Main Street 1',
    active: true,
    placeTypeId: randomUUID(),
  };

  it('should create a place', () => {
    const place = Place.create(
      defaultParams.name,
      {
        longitude: defaultParams.coords.longitude,
        latitude: defaultParams.coords.latitude,
      },
      defaultParams.address,
      defaultParams.active,
      defaultParams.placeTypeId,
    );

    expect(place.getId()).toBeDefined();
    expect(place.getName().value).toBe(defaultParams.name);
    expect(place.getCoords().latitude).toBe(defaultParams.coords.latitude);
    expect(place.getCoords().longitude).toBe(defaultParams.coords.longitude);
    expect(place.getAddress().value).toBe(defaultParams.address);
    expect(place.isActive()).toBe(defaultParams.active);
    expect(place.getPlaceTypeId().value).toBe(defaultParams.placeTypeId);

    const events = place.getUncommittedEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(PlaceCreatedEvent);
    const event = events[0] as PlaceCreatedEvent;
    expect(event.id).toBe(place.getId().value);
    expect(event.name).toBe(defaultParams.name);
    expect(event.latitude).toBe(defaultParams.coords.latitude);
    expect(event.longitude).toBe(defaultParams.coords.longitude);
    expect(event.address).toBe(defaultParams.address);
    expect(event.active).toBe(defaultParams.active);
    expect(event.placeTypeId).toBe(defaultParams.placeTypeId);
  });

  it('should deactivate a place', () => {
    const place = Place.create(
      defaultParams.name,
      {
        longitude: defaultParams.coords.longitude,
        latitude: defaultParams.coords.latitude,
      },
      defaultParams.address,
      true,
      defaultParams.placeTypeId,
    );
    place.commit();

    place.deactivate();

    expect(place.isActive()).toBe(false);
    const events = place.getUncommittedEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(PlaceDeactivatedEvent);
    expect((events[0] as PlaceDeactivatedEvent).id).toBe(place.getId().value);
  });

  it('should not apply event when deactivating already inactive place', () => {
    const place = Place.create(
      defaultParams.name,
      {
        longitude: defaultParams.coords.longitude,
        latitude: defaultParams.coords.latitude,
      },
      defaultParams.address,
      false,
      defaultParams.placeTypeId,
    );
    place.commit();

    place.deactivate();

    expect(place.isActive()).toBe(false);
    expect(place.getUncommittedEvents()).toHaveLength(0);
  });

  it('should activate a place', () => {
    const place = Place.create(
      defaultParams.name,
      {
        longitude: defaultParams.coords.longitude,
        latitude: defaultParams.coords.latitude,
      },
      defaultParams.address,
      false,
      defaultParams.placeTypeId,
    );
    place.commit();

    place.activate();

    expect(place.isActive()).toBe(true);
    const events = place.getUncommittedEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(PlaceActivatedEvent);
    expect((events[0] as PlaceActivatedEvent).id).toBe(place.getId().value);
  });

  it('should not apply event when activating already active place', () => {
    const place = Place.create(
      defaultParams.name,
      {
        longitude: defaultParams.coords.longitude,
        latitude: defaultParams.coords.latitude,
      },
      defaultParams.address,
      true,
      defaultParams.placeTypeId,
    );
    place.commit();

    place.activate();

    expect(place.isActive()).toBe(true);
    expect(place.getUncommittedEvents()).toHaveLength(0);
  });

  it('should update a place', () => {
    const place = Place.create(
      defaultParams.name,
      {
        longitude: defaultParams.coords.longitude,
        latitude: defaultParams.coords.latitude,
      },
      defaultParams.address,
      defaultParams.active,
      defaultParams.placeTypeId,
    );
    place.commit();

    const updateParams = {
      name: 'Updated Name',
      coords: { latitude: 53.0, longitude: 22.0 },
      address: 'Updated Address',
      placeTypeId: randomUUID(),
    };

    place.update(
      updateParams.name,
      {
        longitude: updateParams.coords.longitude,
        latitude: updateParams.coords.latitude,
      },
      updateParams.address,
      updateParams.placeTypeId,
    );

    expect(place.getName().value).toBe(updateParams.name);
    expect(place.getCoords().latitude).toBe(updateParams.coords.latitude);
    expect(place.getCoords().longitude).toBe(updateParams.coords.longitude);
    expect(place.getAddress().value).toBe(updateParams.address);
    expect(place.getPlaceTypeId().value).toBe(updateParams.placeTypeId);

    const events = place.getUncommittedEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(PlaceUpdatedEvent);
    const event = events[0] as PlaceUpdatedEvent;
    expect(event.id).toBe(place.getId().value);
    expect(event.name).toBe(updateParams.name);
    expect(event.latitude).toBe(updateParams.coords.latitude);
    expect(event.longitude).toBe(updateParams.coords.longitude);
    expect(event.address).toBe(updateParams.address);
    expect(event.placeTypeId).toBe(updateParams.placeTypeId);
  });
});
