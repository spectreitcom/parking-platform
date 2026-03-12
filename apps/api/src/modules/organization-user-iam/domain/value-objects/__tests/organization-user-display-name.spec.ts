import { OrganizationUserDisplayName } from '../organization-user-display-name';
import { AppError } from '../../../../../shared/errors';

describe('OrganizationUserDisplayName', () => {
  it('should create a valid organization user display name', () => {
    const nameStr = 'John Doe';
    const displayName = OrganizationUserDisplayName.fromString(nameStr);
    expect(displayName.value).toBe(nameStr);
  });

  it('should throw an error for empty display name', () => {
    expect(() => OrganizationUserDisplayName.fromString('')).toThrow(AppError);
    expect(() => OrganizationUserDisplayName.fromString('')).toThrow(
      'Invalid organization user display name format.',
    );
  });

  it('should throw an error for display name exceeding 120 characters', () => {
    const longName = 'a'.repeat(121);
    expect(() => OrganizationUserDisplayName.fromString(longName)).toThrow(
      AppError,
    );
  });

  it('should return true when comparing two identical display names', () => {
    const nameStr = 'John Doe';
    const name1 = OrganizationUserDisplayName.fromString(nameStr);
    const name2 = OrganizationUserDisplayName.fromString(nameStr);
    expect(name1.equals(name2)).toBe(true);
  });

  it('should return false when comparing two different display names', () => {
    const name1 = OrganizationUserDisplayName.fromString('John Doe');
    const name2 = OrganizationUserDisplayName.fromString('Jane Doe');
    expect(name1.equals(name2)).toBe(false);
  });
});
