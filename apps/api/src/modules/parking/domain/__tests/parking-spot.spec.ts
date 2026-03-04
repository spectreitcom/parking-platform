import { randomUUID } from 'node:crypto';
import { ParkingSpot } from '../parking-spot';
import { ParkingSpotCreatedEvent } from '../events/parking-spot-created.event';
import { ParkingSpotUpdatedEvent } from '../events/parking-spot-updated.event';
import { ParkingSpotActivatedEvent } from '../events/parking-spot-activated.event';
import { ParkingSpotDeactivatedEvent } from '../events/parking-spot-deactivated.event';

describe('ParkingSpot', () => {
  const parkingId = randomUUID();
  const priceInGroszy = 10000;
  const priceInPLN = 100;
  const featureIds = [randomUUID(), randomUUID()];

  it('should create a parking spot aggregate', () => {
    const parkingSpot = ParkingSpot.create(
      parkingId,
      priceInGroszy,
      featureIds,
    );

    expect(parkingSpot.getId()).toBeDefined();
    expect(parkingSpot.getParkingId().value).toBe(parkingId);
    expect(parkingSpot.getPrice().toPLN()).toBe(priceInPLN);
    expect(parkingSpot.getParkingSpotFeatureIds().map((f) => f.value)).toEqual(
      featureIds,
    );
    expect(parkingSpot.isActive()).toBe(true);

    const events = parkingSpot.getUncommittedEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(ParkingSpotCreatedEvent);
    expect(events[0]).toEqual(
      new ParkingSpotCreatedEvent(
        parkingSpot.getId().value,
        parkingId,
        priceInPLN,
        true,
        featureIds,
      ),
    );
  });

  it('should update parking spot data', () => {
    const parkingSpot = ParkingSpot.create(
      parkingId,
      priceInGroszy,
      featureIds,
    );
    const newPriceInGroszy = 15000;
    const newPriceInPLN = 150;
    const newFeatureIds = [randomUUID()];

    parkingSpot.update(newPriceInGroszy, newFeatureIds);

    expect(parkingSpot.getPrice().toPLN()).toBe(newPriceInPLN);
    expect(parkingSpot.getParkingSpotFeatureIds().map((f) => f.value)).toEqual(
      newFeatureIds,
    );

    const events = parkingSpot.getUncommittedEvents();
    expect(events).toHaveLength(2);
    expect(events[1]).toBeInstanceOf(ParkingSpotUpdatedEvent);
    expect(events[1]).toEqual(
      new ParkingSpotUpdatedEvent(
        parkingSpot.getId().value,
        parkingId,
        newPriceInPLN,
        true,
        newFeatureIds,
      ),
    );
  });

  it('should deactivate and activate parking spot', () => {
    const parkingSpot = ParkingSpot.create(
      parkingId,
      priceInGroszy,
      featureIds,
    );

    // Initially active
    expect(parkingSpot.isActive()).toBe(true);

    // Deactivate
    parkingSpot.deactivate();
    expect(parkingSpot.isActive()).toBe(false);

    // Activate
    parkingSpot.activate();
    expect(parkingSpot.isActive()).toBe(true);

    const events = parkingSpot.getUncommittedEvents();
    expect(events.some((e) => e instanceof ParkingSpotDeactivatedEvent)).toBe(
      true,
    );
    expect(events.some((e) => e instanceof ParkingSpotActivatedEvent)).toBe(
      true,
    );

    const deactivationEvent = events.find(
      (e) => e instanceof ParkingSpotDeactivatedEvent,
    );
    const activationEvent = events.find(
      (e) => e instanceof ParkingSpotActivatedEvent,
    );

    expect(deactivationEvent).toEqual(
      new ParkingSpotDeactivatedEvent(parkingSpot.getId().value),
    );
    expect(activationEvent).toEqual(
      new ParkingSpotActivatedEvent(parkingSpot.getId().value),
    );
  });

  it('should not emit event if deactivating already inactive parking spot', () => {
    const parkingSpot = ParkingSpot.create(
      parkingId,
      priceInGroszy,
      featureIds,
    );
    parkingSpot.deactivate();
    const eventsCountBefore = parkingSpot.getUncommittedEvents().length;

    parkingSpot.deactivate();
    expect(parkingSpot.getUncommittedEvents().length).toBe(eventsCountBefore);
  });

  it('should not emit event if activating already active parking spot', () => {
    const parkingSpot = ParkingSpot.create(
      parkingId,
      priceInGroszy,
      featureIds,
    );
    const eventsCountBefore = parkingSpot.getUncommittedEvents().length;

    parkingSpot.activate();
    expect(parkingSpot.getUncommittedEvents().length).toBe(eventsCountBefore);
  });
});
