import { ParkingAddonId } from '../parking-addon-id';
import { randomUUID } from 'node:crypto';

describe('ParkingAddonId', () => {
  it('should create a valid id', () => {
    const id = ParkingAddonId.create();
    expect(id.value).toBeDefined();
    expect(typeof id.value).toBe('string');
  });

  it('should create from string', () => {
    const uuid = randomUUID();
    const id = ParkingAddonId.fromString(uuid);
    expect(id.value).toBe(uuid);
  });

  it('should throw error for invalid id', () => {
    expect(() => ParkingAddonId.fromString('invalid-uuid')).toThrow(
      'Invalid ParkingAddonId',
    );
  });

  it('should compare two ids', () => {
    const uuid = randomUUID();
    const id1 = ParkingAddonId.fromString(uuid);
    const id2 = ParkingAddonId.fromString(uuid);
    const id3 = ParkingAddonId.create();

    expect(id1.equals(id2)).toBe(true);
    expect(id1.equals(id3)).toBe(false);
  });
});
