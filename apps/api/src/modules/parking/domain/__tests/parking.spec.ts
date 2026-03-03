import { randomUUID } from 'node:crypto';
import { Parking } from '../parking';
import { ParkingCreatedEvent } from '../events/parking-created.event';
import { ParkingUpdatedEvent } from '../events/parking-updated.event';
import { ParkingActivatedEvent } from '../events/parking-activated.event';
import { ParkingDeactivatedEvent } from '../events/parking-deactivated.event';

describe('Parking', () => {
  const ownerId = randomUUID();
  const name = 'Test Parking';
  const address = 'Test Address 123';
  const coords = { latitude: 52.2297, longitude: 21.0122 };
  const placeId = randomUUID();

  it('should create a parking aggregate', () => {
    const parking = Parking.create(ownerId, name, address, coords, placeId);

    expect(parking.getId()).toBeDefined();
    expect(parking.getOwnerId().value).toBe(ownerId);
    expect(parking.getName().value).toBe(name);
    expect(parking.getAddress().value).toBe(address);
    expect(parking.getCoords().latitude).toBe(coords.latitude);
    expect(parking.getCoords().longitude).toBe(coords.longitude);
    expect(parking.getPlaceId().value).toBe(placeId);
    expect(parking.isActive()).toBe(true);
    expect(parking.getAssetIds()).toEqual([]);
    expect(parking.getParkingFeatureIds()).toEqual([]);
    expect(parking.getParkingAddonIds()).toEqual([]);

    const events = parking.getUncommittedEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(ParkingCreatedEvent);
    expect(events[0]).toEqual(
      new ParkingCreatedEvent(
        parking.getId().value,
        ownerId,
        placeId,
        name,
        address,
        coords.latitude,
        coords.longitude,
        [],
        [],
        true,
        [],
        '',
        '',
      ),
    );
  });

  it('should update parking data', () => {
    const parking = Parking.create(ownerId, name, address, coords, placeId);
    const newName = 'Updated Parking';
    const newAddress = 'Updated Address 456';
    const newCoords = { latitude: 50.0647, longitude: 19.945 };
    const assetIds = [randomUUID()];
    const featureIds = [randomUUID()];
    const addonIds = [randomUUID()];
    const description = 'New description';
    const statue = 'Statue info';

    parking.update(
      newName,
      newAddress,
      newCoords,
      assetIds,
      featureIds,
      addonIds,
      description,
      statue,
    );

    expect(parking.getName().value).toBe(newName);
    expect(parking.getAddress().value).toBe(newAddress);
    expect(parking.getCoords().latitude).toBe(newCoords.latitude);
    expect(parking.getCoords().longitude).toBe(newCoords.longitude);
    expect(parking.getAssetIds().map((id) => id.value)).toEqual(assetIds);
    expect(parking.getParkingFeatureIds().map((id) => id.value)).toEqual(
      featureIds,
    );
    expect(parking.getParkingAddonIds().map((id) => id.value)).toEqual(
      addonIds,
    );
    expect(parking.getDescription()).toBe(description);
    expect(parking.getStatute()).toBe(statue);

    const events = parking.getUncommittedEvents();
    expect(events[1]).toBeInstanceOf(ParkingUpdatedEvent);
    expect(events[1]).toEqual(
      new ParkingUpdatedEvent(
        parking.getId().value,
        ownerId,
        placeId,
        newName,
        newAddress,
        newCoords.latitude,
        newCoords.longitude,
        featureIds,
        addonIds,
        true,
        assetIds,
        description,
        statue,
      ),
    );
  });

  it('should deactivate and activate parking', () => {
    const parking = Parking.create(ownerId, name, address, coords, placeId);

    // Initially active
    expect(parking.isActive()).toBe(true);

    // Deactivate
    parking.deactivate();
    expect(parking.isActive()).toBe(false);

    // Activate
    parking.activate();
    expect(parking.isActive()).toBe(true);

    const events = parking.getUncommittedEvents();
    expect(events.some((e) => e instanceof ParkingDeactivatedEvent)).toBe(true);
    expect(events.some((e) => e instanceof ParkingActivatedEvent)).toBe(true);

    const deactivationEvent = events.find(
      (e) => e instanceof ParkingDeactivatedEvent,
    );
    const activationEvent = events.find(
      (e) => e instanceof ParkingActivatedEvent,
    );

    expect(deactivationEvent).toEqual(
      new ParkingDeactivatedEvent(parking.getId().value),
    );
    expect(activationEvent).toEqual(
      new ParkingActivatedEvent(parking.getId().value),
    );
  });

  it('should not emit event if deactivating already inactive parking', () => {
    const parking = Parking.create(ownerId, name, address, coords, placeId);
    parking.deactivate();
    const eventsCountBefore = parking.getUncommittedEvents().length;

    parking.deactivate();
    expect(parking.getUncommittedEvents().length).toBe(eventsCountBefore);
  });

  it('should not emit event if activating already active parking', () => {
    const parking = Parking.create(ownerId, name, address, coords, placeId);
    const eventsCountBefore = parking.getUncommittedEvents().length;

    parking.activate();
    expect(parking.getUncommittedEvents().length).toBe(eventsCountBefore);
  });
});
