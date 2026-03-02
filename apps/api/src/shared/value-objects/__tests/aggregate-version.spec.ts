import { AggregateVersion } from '../aggregate-version';

describe('AggregateVersion', () => {
  it('should create a valid aggregate version', () => {
    const value = 1;
    const aggregateVersion = new AggregateVersion(value);
    expect(aggregateVersion.value).toBe(value);
  });

  it('should throw an error if the value is zero', () => {
    expect(() => new AggregateVersion(0)).toThrow('Invalid aggregate version');
  });

  it('should throw an error if the value is negative', () => {
    expect(() => new AggregateVersion(-1)).toThrow('Invalid aggregate version');
  });

  it('should throw an error if the value is not an integer', () => {
    expect(() => new AggregateVersion(1.5)).toThrow(
      'Invalid aggregate version',
    );
  });

  describe('equals', () => {
    it('should return true if both versions are equal', () => {
      const version1 = new AggregateVersion(1);
      const version2 = new AggregateVersion(1);
      expect(version1.equals(version2)).toBe(true);
    });

    it('should return false if versions are different', () => {
      const version1 = new AggregateVersion(1);
      const version2 = new AggregateVersion(2);
      expect(version1.equals(version2)).toBe(false);
    });
  });
});
