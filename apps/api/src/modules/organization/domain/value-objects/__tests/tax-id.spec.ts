import { OrganizationTaxId } from '../organization-tax-id';
import { AppError } from '../../../../../shared/errors';

describe('OrganizationTaxId', () => {
  it('should create a valid organization tax ID', () => {
    const taxId = 'PL1234567890';
    const organizationTaxId = OrganizationTaxId.fromString(taxId);
    expect(organizationTaxId.value).toBe(taxId);
  });

  it('should throw an error for an empty organization tax ID', () => {
    expect(() => OrganizationTaxId.fromString('')).toThrow(AppError);
    expect(() => OrganizationTaxId.fromString('')).toThrow(
      'Invalid tax ID format.',
    );
  });

  it('should throw an error for a tax ID longer than 120 characters', () => {
    const longTaxId = 'a'.repeat(121);
    expect(() => OrganizationTaxId.fromString(longTaxId)).toThrow(AppError);
    expect(() => OrganizationTaxId.fromString(longTaxId)).toThrow(
      'Invalid tax ID format.',
    );
  });

  it('should return true when comparing two identical tax IDs', () => {
    const taxId1 = OrganizationTaxId.fromString('PL123');
    const taxId2 = OrganizationTaxId.fromString('PL123');
    expect(taxId1.equals(taxId2)).toBe(true);
  });

  it('should return false when comparing two different tax IDs', () => {
    const taxId1 = OrganizationTaxId.fromString('PL123');
    const taxId2 = OrganizationTaxId.fromString('PL456');
    expect(taxId1.equals(taxId2)).toBe(false);
  });
});
