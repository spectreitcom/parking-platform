import { AdminDisplayName } from '../admin-display-name';

describe('AdminDisplayName', () => {
  it('should create from string', () => {
    const name = 'Jan Kowalski';
    const adminDisplayName = AdminDisplayName.fromString(name);
    expect(adminDisplayName.value).toBe(name);
  });

  it('should throw error for too long display name', () => {
    const longName = 'a'.repeat(1202);
    expect(() => AdminDisplayName.fromString(longName)).toThrow(
      'Invalid AdminDisplayName',
    );
  });

  it('should compare two display names for equality', () => {
    const name = 'Jan Kowalski';
    const name1 = AdminDisplayName.fromString(name);
    const name2 = AdminDisplayName.fromString(name);
    const name3 = AdminDisplayName.fromString('Inny Admin');

    expect(name1.equals(name2)).toBe(true);
    expect(name1.equals(name3)).toBe(false);
  });
});
