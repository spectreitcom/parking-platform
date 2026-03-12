import { OrganizationAddress } from '../organization-address';
import { AppError } from '../../../../../shared/errors';

describe('OrganizationAddress', () => {
  it('should create a valid organization address', () => {
    const address = '123 Main St, City, Country';
    const organizationAddress = OrganizationAddress.fromString(address);
    expect(organizationAddress.value).toBe(address);
  });

  it('should throw an error for an empty organization address', () => {
    expect(() => OrganizationAddress.fromString('')).toThrow(AppError);
    expect(() => OrganizationAddress.fromString('')).toThrow(
      'Invalid organization address',
    );
  });

  it('should throw an error for an address longer than 255 characters', () => {
    const longAddress = 'a'.repeat(256);
    expect(() => OrganizationAddress.fromString(longAddress)).toThrow(AppError);
    expect(() => OrganizationAddress.fromString(longAddress)).toThrow(
      'Invalid organization address',
    );
  });

  it('should return true when comparing two identical addresses', () => {
    const address1 = OrganizationAddress.fromString('Address 1');
    const address2 = OrganizationAddress.fromString('Address 1');
    expect(address1.equals(address2)).toBe(true);
  });

  it('should return false when comparing two different addresses', () => {
    const address1 = OrganizationAddress.fromString('Address 1');
    const address2 = OrganizationAddress.fromString('Address 2');
    expect(address1.equals(address2)).toBe(false);
  });
});
