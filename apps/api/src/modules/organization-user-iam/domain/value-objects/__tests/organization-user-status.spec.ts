import { OrganizationUserStatus } from '../organization-user-status';
import { AppError } from '../../../../../shared/errors';
import {
  ORGANIZATION_USER_ACTIVE,
  ORGANIZATION_USER_CREATED,
  ORGANIZATION_USER_INVITED,
  ORGANIZATION_USER_SUSPENDED,
} from '../../constants';

describe('OrganizationUserStatus', () => {
  it('should create a created status', () => {
    const status = OrganizationUserStatus.created();
    expect(status.value).toBe(ORGANIZATION_USER_CREATED);
  });

  it('should create an invited status', () => {
    const status = OrganizationUserStatus.invited();
    expect(status.value).toBe(ORGANIZATION_USER_INVITED);
  });

  it('should create an active status', () => {
    const status = OrganizationUserStatus.active();
    expect(status.value).toBe(ORGANIZATION_USER_ACTIVE);
  });

  it('should create a suspended status', () => {
    const status = OrganizationUserStatus.suspended();
    expect(status.value).toBe(ORGANIZATION_USER_SUSPENDED);
  });

  it('should create status from string', () => {
    const status = OrganizationUserStatus.fromString(ORGANIZATION_USER_ACTIVE);
    expect(status.value).toBe(ORGANIZATION_USER_ACTIVE);
  });

  it('should throw error for invalid status string', () => {
    expect(() => OrganizationUserStatus.fromString('INVALID')).toThrow(
      AppError,
    );
    expect(() => OrganizationUserStatus.fromString('INVALID')).toThrow(
      'Invalid OrganizationUserStatus',
    );
  });

  it('should return true when comparing identical statuses', () => {
    const s1 = OrganizationUserStatus.active();
    const s2 = OrganizationUserStatus.active();
    expect(s1.equals(s2)).toBe(true);
  });

  it('should return false when comparing different statuses', () => {
    const s1 = OrganizationUserStatus.active();
    const s2 = OrganizationUserStatus.suspended();
    expect(s1.equals(s2)).toBe(false);
  });
});
