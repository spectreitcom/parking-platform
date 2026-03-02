import { Coords } from '../coords';

describe('Coords', () => {
  it('should create from numbers', () => {
    const lat = 52.2297;
    const lng = 21.0122;
    const coords = Coords.fromNumbers(lat, lng);
    expect(coords.latitude).toBe(lat);
    expect(coords.longitude).toBe(lng);
  });

  it('should throw error for invalid latitude', () => {
    expect(() => Coords.fromNumbers(91, 0)).toThrow('Invalid Coords');
    expect(() => Coords.fromNumbers(-91, 0)).toThrow('Invalid Coords');
  });

  it('should throw error for invalid longitude', () => {
    expect(() => Coords.fromNumbers(0, 181)).toThrow('Invalid Coords');
    expect(() => Coords.fromNumbers(0, -181)).toThrow('Invalid Coords');
  });

  it('should compare two coords for equality', () => {
    const coords1 = Coords.fromNumbers(52.2297, 21.0122);
    const coords2 = Coords.fromNumbers(52.2297, 21.0122);
    const coords3 = Coords.fromNumbers(52.2298, 21.0122);

    expect(coords1.equals(coords2)).toBe(true);
    expect(coords1.equals(coords3)).toBe(false);
  });
});
