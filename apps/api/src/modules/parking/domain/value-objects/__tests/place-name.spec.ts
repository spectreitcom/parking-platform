import { PlaceName } from '../place-name';

describe('PlaceName', () => {
  it('should create from string and trim whitespace', () => {
    const nameStr = '  Parking Place 1  ';
    const name = PlaceName.fromString(nameStr);
    expect(name.value).toBe('Parking Place 1');
  });

  it('should replace multiple spaces with single space', () => {
    const nameStr = 'Parking    Place   1';
    const name = PlaceName.fromString(nameStr);
    expect(name.value).toBe('Parking Place 1');
  });

  it('should throw error for empty name', () => {
    const invalidName = '';
    expect(() => PlaceName.fromString(invalidName)).toThrow(
      'Invalid PlaceName',
    );
  });

  it('should throw error for too long name', () => {
    const longName = 'A'.repeat(256);
    expect(() => PlaceName.fromString(longName)).toThrow('Invalid PlaceName');
  });

  it('should compare two names for equality', () => {
    const nameStr = 'Place 1';
    const name1 = PlaceName.fromString(nameStr);
    const name2 = PlaceName.fromString('  Place 1  ');
    const name3 = PlaceName.fromString('Place 2');

    expect(name1.equals(name2)).toBe(true);
    expect(name1.equals(name3)).toBe(false);
  });
});
