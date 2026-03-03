import { ParkingFeatureLevel } from '../parking-feature-level';
import { PARKING_LEVEL, PARKING_SPOT_LEVEL } from '../../constants';

describe('ParkingFeatureLevel', () => {
  it('should create parking level', () => {
    const level = ParkingFeatureLevel.parkingLevel();
    expect(level.value).toBe(PARKING_LEVEL);
  });

  it('should create parking spot level', () => {
    const level = ParkingFeatureLevel.parkingSpotLevel();
    expect(level.value).toBe(PARKING_SPOT_LEVEL);
  });

  it('should create from string', () => {
    const level = ParkingFeatureLevel.fromString(PARKING_LEVEL);
    expect(level.value).toBe(PARKING_LEVEL);
  });

  it('should throw error for invalid level', () => {
    expect(() => ParkingFeatureLevel.fromString('INVALID')).toThrow(
      'Invalid ParkingFeatureLevel',
    );
  });

  it('should create from array of strings', () => {
    const levels = ParkingFeatureLevel.fromArray([
      PARKING_LEVEL,
      PARKING_SPOT_LEVEL,
    ]);
    expect(levels).toHaveLength(2);
    expect(levels[0].value).toBe(PARKING_LEVEL);
    expect(levels[1].value).toBe(PARKING_SPOT_LEVEL);
  });

  it('should return true for identical levels', () => {
    const level1 = ParkingFeatureLevel.parkingLevel();
    const level2 = ParkingFeatureLevel.parkingLevel();
    expect(level1.equals(level2)).toBe(true);
  });

  it('should return false for different levels', () => {
    const level1 = ParkingFeatureLevel.parkingLevel();
    const level2 = ParkingFeatureLevel.parkingSpotLevel();
    expect(level1.equals(level2)).toBe(false);
  });
});
