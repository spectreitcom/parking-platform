import { ParkingFeature } from '../parking-feature';
import { ParkingFeatureCreatedEvent } from '../events/parking-feature-created.event';
import { ParkingFeatureUpdatedEvent } from '../events/parking-feature-updated.event';
import { ParkingFeatureDeletedEvent } from '../events/parking-feature-deleted.event';
import { PARKING_LEVEL, PARKING_SPOT_LEVEL } from '../constants';

describe('ParkingFeature', () => {
  const defaultParams = {
    name: 'Feature 1',
    levels: [PARKING_LEVEL],
  };

  it('should create a parking feature', () => {
    const feature = ParkingFeature.create(
      defaultParams.name,
      defaultParams.levels,
    );

    expect(feature.getId()).toBeDefined();
    expect(feature.getName().value).toBe(defaultParams.name);
    expect(feature.getLevels()).toHaveLength(1);
    expect(feature.getLevels()[0].value).toBe(defaultParams.levels[0]);
    expect(feature.getVersion().value).toBe(1);

    const events = feature.getUncommittedEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(ParkingFeatureCreatedEvent);
    const event = events[0] as ParkingFeatureCreatedEvent;
    expect(event.id).toBe(feature.getId().value);
    expect(event.name).toBe(defaultParams.name);
    expect(event.levels).toEqual(defaultParams.levels);
  });

  it('should update a parking feature', () => {
    const feature = ParkingFeature.create(
      defaultParams.name,
      defaultParams.levels,
    );
    feature.commit();

    const updateParams = {
      name: 'Updated Feature',
      levels: [PARKING_LEVEL, PARKING_SPOT_LEVEL],
    };

    feature.update(updateParams.name, updateParams.levels);

    expect(feature.getName().value).toBe(updateParams.name);
    expect(feature.getLevels()).toHaveLength(2);
    expect(feature.getLevels().map((l) => l.value)).toEqual(
      updateParams.levels,
    );

    const events = feature.getUncommittedEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(ParkingFeatureUpdatedEvent);
    const event = events[0] as ParkingFeatureUpdatedEvent;
    expect(event.id).toBe(feature.getId().value);
    expect(event.name).toBe(updateParams.name);
    expect(event.levels).toEqual(updateParams.levels);
  });

  it('should delete a parking feature', () => {
    const feature = ParkingFeature.create(
      defaultParams.name,
      defaultParams.levels,
    );
    feature.commit();

    feature.delete();

    const events = feature.getUncommittedEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(ParkingFeatureDeletedEvent);
    const event = events[0] as ParkingFeatureDeletedEvent;
    expect(event.id).toBe(feature.getId().value);
  });
});
