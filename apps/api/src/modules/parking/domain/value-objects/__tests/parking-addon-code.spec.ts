import { ParkingAddonCode } from '../parking-addon-code';

describe('ParkingAddonCode', () => {
  it('should create from valid string', () => {
    const code = ParkingAddonCode.fromString('PA_PREMIUM');
    expect(code.value).toBe('PA_PREMIUM');
  });

  it('should throw error for empty code', () => {
    expect(() => ParkingAddonCode.fromString('')).toThrow(
      'Invalid ParkingAddonCode',
    );
  });

  it('should compare two codes', () => {
    const code1 = ParkingAddonCode.fromString('PA1');
    const code2 = ParkingAddonCode.fromString('PA1');
    const code3 = ParkingAddonCode.fromString('PA2');

    expect(code1.equals(code2)).toBe(true);
    expect(code1.equals(code3)).toBe(false);
  });
});
