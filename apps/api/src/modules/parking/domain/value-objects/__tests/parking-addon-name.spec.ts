import { ParkingAddonName } from '../parking-addon-name';

describe('ParkingAddonName', () => {
  it('should create from valid string', () => {
    const name = ParkingAddonName.fromString('Premium Parking');
    expect(name.value).toBe('Premium Parking');
  });

  it('should trim and normalize spaces', () => {
    const name = ParkingAddonName.fromString('  Premium    Parking  ');
    expect(name.value).toBe('Premium Parking');
  });

  it('should throw error for empty name', () => {
    expect(() => ParkingAddonName.fromString('')).toThrow(
      'Invalid ParkingAddonName',
    );
    expect(() => ParkingAddonName.fromString('   ')).toThrow(
      'Invalid ParkingAddonName',
    );
  });

  it('should throw error for too long name', () => {
    const longName = 'a'.repeat(256);
    expect(() => ParkingAddonName.fromString(longName)).toThrow(
      'Invalid ParkingAddonName',
    );
  });

  it('should compare two names', () => {
    const name1 = ParkingAddonName.fromString('Premium');
    const name2 = ParkingAddonName.fromString('Premium');
    const name3 = ParkingAddonName.fromString('Standard');

    expect(name1.equals(name2)).toBe(true);
    expect(name1.equals(name3)).toBe(false);
  });
});
