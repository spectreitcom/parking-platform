import { OrganizationUserId } from '../organization-user-id';
import { AppError } from 'src/shared/errors';
import { randomUUID } from 'node:crypto';

describe('OrganizationUserId', () => {
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

  it('should return true when comparing two identical user IDs', () => {
    const uuid = randomUUID();
    const id1 = OrganizationUserId.fromString(uuid);
    const id2 = OrganizationUserId.fromString(uuid);
    expect(id1.equals(id2)).toBe(true);
  });

  it('should return false when comparing two different user IDs', () => {
    const id1 = OrganizationUserId.fromString(randomUUID());
    const id2 = OrganizationUserId.fromString(randomUUID());
    expect(id1.equals(id2)).toBe(false);
  });
});
