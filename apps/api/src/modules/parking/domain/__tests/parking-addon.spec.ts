import { ParkingAddon } from '../parking-addon';
import { ParkingAddonCreatedEvent } from '../events/parking-addon-created.event';
import { ParkingAddonUpdatedEvent } from '../events/parking-addon-updated.event';
import { ParkingAddonDeletedEvent } from '../events/parking-addon-deleted.event';

describe('ParkingAddon', () => {
  it('should create a parking addon and apply created event', () => {
    const code = 'PA1';
    const name = 'Premium';
    const price = 1000;

    const addon = ParkingAddon.create(code, name, price);

    expect(addon.getCode().value).toBe(code);
    expect(addon.getName().value).toBe(name);
    expect(addon.getPrice().value).toBe(price);

    const events = addon.getUncommittedEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(ParkingAddonCreatedEvent);
    expect((events[0] as ParkingAddonCreatedEvent).id).toBe(
      addon.getId().value,
    );
  });

  it('should update parking addon and apply updated event', () => {
    const addon = ParkingAddon.create('PA1', 'Premium', 1000);
    addon.uncommit(); // Clear creation event

    addon.update('New Name', 2000);

    expect(addon.getName().value).toBe('New Name');
    expect(addon.getPrice().value).toBe(2000);

    const events = addon.getUncommittedEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(ParkingAddonUpdatedEvent);
    expect((events[0] as ParkingAddonUpdatedEvent).name).toBe('New Name');
  });

  it('should apply deleted event when deleted', () => {
    const addon = ParkingAddon.create('PA1', 'Premium', 1000);
    addon.uncommit();

    addon.delete();

    const events = addon.getUncommittedEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(ParkingAddonDeletedEvent);
    expect((events[0] as ParkingAddonDeletedEvent).id).toBe(
      addon.getId().value,
    );
  });
});
