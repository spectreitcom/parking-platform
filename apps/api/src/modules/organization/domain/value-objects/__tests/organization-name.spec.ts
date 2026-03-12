import { OrganizationName } from '../organization-name';
import { AppError } from '../../../../../shared/errors';

describe('OrganizationName', () => {
  it('should create a valid organization name', () => {
    const name = 'Valid Organization Name';
    const organizationName = OrganizationName.fromString(name);
    expect(organizationName.value).toBe(name);
  });

  it('should throw an error for an empty organization name', () => {
    expect(() => OrganizationName.fromString('')).toThrow(AppError);
    expect(() => OrganizationName.fromString('')).toThrow(
      'Invalid organization name format.',
    );
  });

  it('should throw an error for a name longer than 255 characters', () => {
    const longName = 'a'.repeat(256);
    expect(() => OrganizationName.fromString(longName)).toThrow(AppError);
    expect(() => OrganizationName.fromString(longName)).toThrow(
      'Invalid organization name format.',
    );
  });

  it('should return true when comparing two identical names', () => {
    const name1 = OrganizationName.fromString('Org');
    const name2 = OrganizationName.fromString('Org');
    expect(name1.equals(name2)).toBe(true);
  });

  it('should return false when comparing two different names', () => {
    const name1 = OrganizationName.fromString('Org1');
    const name2 = OrganizationName.fromString('Org2');
    expect(name1.equals(name2)).toBe(false);
  });
});
