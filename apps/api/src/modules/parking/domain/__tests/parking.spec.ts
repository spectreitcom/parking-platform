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
    expect(parking.getStatue()).toBe(statue);

    const events = parking.getUncommittedEvents();
    expect(events[1]).toBeInstanceOf(ParkingUpdatedEvent);
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
