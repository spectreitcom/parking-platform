import { ParkingTypeName } from '../parking-type-name';

describe('ParkingTypeName', () => {
  it('should create from string', () => {
    const nameStr = 'Standard';
    const name = ParkingTypeName.fromString(nameStr);
    expect(name.value).toBe(nameStr);
  });

  it('should throw error for empty name', () => {
    const invalidName = '';
    expect(() => ParkingTypeName.fromString(invalidName)).toThrow(
      'Invalid ParkingTypeName',
    );
  });

  it('should throw error for too long name', () => {
    const longName = 'A'.repeat(61);
    expect(() => ParkingTypeName.fromString(longName)).toThrow(
      'Invalid ParkingTypeName',
    );
  });

  it('should compare two names for equality', () => {
    const nameStr = 'Standard';
    const name1 = ParkingTypeName.fromString(nameStr);
    const name2 = ParkingTypeName.fromString(nameStr);
    const name3 = ParkingTypeName.fromString('Premium');

    expect(name1.equals(name2)).toBe(true);
    expect(name1.equals(name3)).toBe(false);
  });
});
