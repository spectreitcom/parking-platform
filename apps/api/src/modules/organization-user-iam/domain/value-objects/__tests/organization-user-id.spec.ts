import { OrganizationUserId } from '../organization-user-id';
import { AppError } from '../../../../../shared/errors';
import { randomUUID } from 'node:crypto';

describe('OrganizationUserId', () => {
  it('should create a valid organization user ID using create', () => {
    const organizationUserId = OrganizationUserId.create();
    expect(organizationUserId.value).toBeDefined();
    // basic UUID v4 check
    expect(organizationUserId.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('should create an organization user ID from string', () => {
    const uuid = randomUUID();
    const organizationUserId = OrganizationUserId.fromString(uuid);
    expect(organizationUserId.value).toBe(uuid);
  });

  it('should throw an error for an invalid UUID format', () => {
    expect(() => OrganizationUserId.fromString('invalid-uuid')).toThrow(
      AppError,
    );
    expect(() => OrganizationUserId.fromString('invalid-uuid')).toThrow(
      'Invalid organization user ID format',
    );
  });

  it('should return true when comparing two identical IDs', () => {
    const uuid = randomUUID();
    const id1 = OrganizationUserId.fromString(uuid);
    const id2 = OrganizationUserId.fromString(uuid);
    expect(id1.equals(id2)).toBe(true);
  });

  it('should return false when comparing two different IDs', () => {
    const id1 = OrganizationUserId.create();
    const id2 = OrganizationUserId.create();
    expect(id1.equals(id2)).toBe(false);
  });
});
