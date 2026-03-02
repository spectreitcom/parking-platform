import { PlaceType } from '../place-type';
import { PlaceTypeCreatedEvent } from '../events/place-type-created.event';
import { PlaceTypeUpdatedEvent } from '../events/place-type-updated.event';
import { PlaceTypeDeletedEvent } from '../events/place-type-deleted.event';

describe('PlaceType', () => {
  it('should create a place type', () => {
    const name = 'Standard';
    const placeType = PlaceType.create(name);

    expect(placeType.getId()).toBeDefined();
    expect(placeType.getName().value).toBe(name);

    const events = placeType.getUncommittedEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(PlaceTypeCreatedEvent);
    expect((events[0] as PlaceTypeCreatedEvent).name).toBe(name);
    expect((events[0] as PlaceTypeCreatedEvent).id).toBe(
      placeType.getId().value,
    );
  });

  it('should update place type name', () => {
    const placeType = PlaceType.create('Standard');
    placeType.commit(); // Clear events

    const newName = 'Premium';
    placeType.update(newName);

    expect(placeType.getName().value).toBe(newName);

    const events = placeType.getUncommittedEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(PlaceTypeUpdatedEvent);
    expect((events[0] as PlaceTypeUpdatedEvent).name).toBe(newName);
    expect((events[0] as PlaceTypeUpdatedEvent).id).toBe(
      placeType.getId().value,
    );
  });

  it('should delete place type', () => {
    const placeType = PlaceType.create('Standard');
    placeType.commit(); // Clear events

    placeType.delete();

    const events = placeType.getUncommittedEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(PlaceTypeDeletedEvent);
    expect((events[0] as PlaceTypeDeletedEvent).id).toBe(
      placeType.getId().value,
    );
  });
});
