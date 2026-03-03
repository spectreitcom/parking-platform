import { ParkingFeatureName } from '../parking-feature-name';

describe('ParkingFeatureName', () => {
  it('should create from string', () => {
    const name = 'Feature 1';
    const featureName = ParkingFeatureName.fromString(name);
    expect(featureName.value).toBe(name);
  });

  it('should throw error for too long name', () => {
    const longName = 'a'.repeat(256);
    expect(() => ParkingFeatureName.fromString(longName)).toThrow(
      'Invalid ParkingFeatureName',
    );
  });

  it('should return true for identical names', () => {
    const name1 = ParkingFeatureName.fromString('Feature');
    const name2 = ParkingFeatureName.fromString('Feature');
    expect(name1.equals(name2)).toBe(true);
  });

  it('should return false for different names', () => {
    const name1 = ParkingFeatureName.fromString('Feature 1');
    const name2 = ParkingFeatureName.fromString('Feature 2');
    expect(name1.equals(name2)).toBe(false);
  });
});
