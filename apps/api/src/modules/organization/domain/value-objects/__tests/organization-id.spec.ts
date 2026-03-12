import { OrganizationId } from '../organization-id';
import { AppError } from '../../../../../shared/errors';

describe('OrganizationId', () => {
  it('should create a valid organization ID using create', () => {
    const organizationId = OrganizationId.create();
    expect(organizationId.value).toBeDefined();
    // basic UUID v4 check
    expect(organizationId.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('should create an organization ID from string', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const organizationId = OrganizationId.fromString(uuid);
    expect(organizationId.value).toBe(uuid);
  });

  it('should throw an error for an invalid UUID format', () => {
    expect(() => OrganizationId.fromString('invalid-uuid')).toThrow(AppError);
    expect(() => OrganizationId.fromString('invalid-uuid')).toThrow(
      'Invalid organization ID format',
    );
  });

  it('should return true when comparing two identical IDs', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const id1 = OrganizationId.fromString(uuid);
    const id2 = OrganizationId.fromString(uuid);
    expect(id1.equals(id2)).toBe(true);
  });

  it('should return false when comparing two different IDs', () => {
    const id1 = OrganizationId.create();
    const id2 = OrganizationId.create();
    expect(id1.equals(id2)).toBe(false);
  });
});
