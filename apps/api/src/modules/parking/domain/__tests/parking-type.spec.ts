import { ParkingType } from '../parking-type';
import { ParkingTypeCreatedEvent } from '../events/parking-type-created.event';
import { ParkingTypeUpdatedEvent } from '../events/parking-type-updated.event';
import { ParkingTypeDeletedEvent } from '../events/parking-type-deleted.event';

describe('ParkingType', () => {
  it('should create a parking type', () => {
    const name = 'Standard';
    const parkingType = ParkingType.create(name);

    expect(parkingType.getId()).toBeDefined();
    expect(parkingType.getName().value).toBe(name);

    const events = parkingType.getUncommittedEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(ParkingTypeCreatedEvent);
    expect((events[0] as ParkingTypeCreatedEvent).name).toBe(name);
    expect((events[0] as ParkingTypeCreatedEvent).id).toBe(
      parkingType.getId().value,
    );
  });

  it('should update parking type name', () => {
    const parkingType = ParkingType.create('Standard');
    parkingType.commit(); // Clear events

    const newName = 'Premium';
    parkingType.update(newName);

    expect(parkingType.getName().value).toBe(newName);

    const events = parkingType.getUncommittedEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(ParkingTypeUpdatedEvent);
    expect((events[0] as ParkingTypeUpdatedEvent).name).toBe(newName);
    expect((events[0] as ParkingTypeUpdatedEvent).id).toBe(
      parkingType.getId().value,
    );
  });

  it('should delete parking type', () => {
    const parkingType = ParkingType.create('Standard');
    parkingType.commit(); // Clear events

    parkingType.delete();

    const events = parkingType.getUncommittedEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(ParkingTypeDeletedEvent);
    expect((events[0] as ParkingTypeDeletedEvent).id).toBe(
      parkingType.getId().value,
    );
  });
});
