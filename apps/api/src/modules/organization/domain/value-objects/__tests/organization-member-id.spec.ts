import { OrganizationMemberId } from '../organization-member-id';
import { AppError } from '../../../../../shared/errors';
import { randomUUID } from 'node:crypto';

describe('OrganizationMemberId', () => {
  it('should create a valid organization member ID using create', () => {
    const organizationMemberId = OrganizationMemberId.create();
    expect(organizationMemberId.value).toBeDefined();
    // basic UUID v4 check
    expect(organizationMemberId.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('should create an organization member ID from string', () => {
    const uuid = randomUUID();
    const organizationMemberId = OrganizationMemberId.fromString(uuid);
    expect(organizationMemberId.value).toBe(uuid);
  });

  it('should throw an error for an invalid UUID format', () => {
    expect(() => OrganizationMemberId.fromString('invalid-uuid')).toThrow(
      AppError,
    );
    expect(() => OrganizationMemberId.fromString('invalid-uuid')).toThrow(
      'Invalid organization member ID format',
    );
  });

  it('should return true when comparing two identical IDs', () => {
    const uuid = randomUUID();
    const id1 = OrganizationMemberId.fromString(uuid);
    const id2 = OrganizationMemberId.fromString(uuid);
    expect(id1.equals(id2)).toBe(true);
  });

  it('should return false when comparing two different IDs', () => {
    const id1 = OrganizationMemberId.create();
    const id2 = OrganizationMemberId.create();
    expect(id1.equals(id2)).toBe(false);
  });
});
