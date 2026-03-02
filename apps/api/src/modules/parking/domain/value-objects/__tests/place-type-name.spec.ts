import { PlaceTypeName } from '../place-type-name';

describe('PlaceTypeName', () => {
  it('should create from string', () => {
    const nameStr = 'Standard';
    const name = PlaceTypeName.fromString(nameStr);
    expect(name.value).toBe(nameStr);
  });

  it('should throw error for empty name', () => {
    const invalidName = '';
    expect(() => PlaceTypeName.fromString(invalidName)).toThrow(
      'Invalid PlaceTypeName',
    );
  });

  it('should throw error for too long name', () => {
    const longName = 'A'.repeat(61);
    expect(() => PlaceTypeName.fromString(longName)).toThrow(
      'Invalid PlaceTypeName',
    );
  });

  it('should compare two names for equality', () => {
    const nameStr = 'Standard';
    const name1 = PlaceTypeName.fromString(nameStr);
    const name2 = PlaceTypeName.fromString(nameStr);
    const name3 = PlaceTypeName.fromString('Premium');

    expect(name1.equals(name2)).toBe(true);
    expect(name1.equals(name3)).toBe(false);
  });
});
