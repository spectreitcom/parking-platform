import { ParkingName } from '../parking-name';

describe('ParkingName', () => {
  it('should create from valid string', () => {
    const name = 'Parking Center';
    const parkingName = ParkingName.fromString(name);
    expect(parkingName.value).toBe(name);
  });

  it('should trim and normalize whitespace', () => {
    const name = '  Parking   Center  ';
    const parkingName = ParkingName.fromString(name);
    expect(parkingName.value).toBe('Parking Center');
  });

  it('should throw error for empty string', () => {
    expect(() => ParkingName.fromString('')).toThrow('Invalid ParkingName');
    expect(() => ParkingName.fromString('   ')).toThrow('Invalid ParkingName');
  });

  it('should throw error for too long string', () => {
    const longName = 'a'.repeat(256);
    expect(() => ParkingName.fromString(longName)).toThrow(
      'Invalid ParkingName',
    );
  });

  it('should compare two names for equality', () => {
    const name1 = ParkingName.fromString('Parking');
    const name2 = ParkingName.fromString('Parking');
    const name3 = ParkingName.fromString('Other');

    expect(name1.equals(name2)).toBe(true);
    expect(name1.equals(name3)).toBe(false);
  });
});
