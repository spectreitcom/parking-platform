import { AdminStatus } from '../admin-status';
import {
  ADMIN_ACTIVE,
  ADMIN_CREATED,
  ADMIN_INVITED,
  ADMIN_SUSPENDED,
} from '../../constants';

describe('AdminStatus', () => {
  it('should create status created', () => {
    const status = AdminStatus.created();
    expect(status.value).toBe(ADMIN_CREATED);
  });

  it('should create status invited', () => {
    const status = AdminStatus.invited();
    expect(status.value).toBe(ADMIN_INVITED);
  });

  it('should create status suspended', () => {
    const status = AdminStatus.suspended();
    expect(status.value).toBe(ADMIN_SUSPENDED);
  });

  it('should create status active', () => {
    const status = AdminStatus.active();
    expect(status.value).toBe(ADMIN_ACTIVE);
  });

  it('should create from string', () => {
    const status = AdminStatus.fromString(ADMIN_ACTIVE);
    expect(status.value).toBe(ADMIN_ACTIVE);
  });

  it('should throw error for invalid status string', () => {
    expect(() => AdminStatus.fromString('INVALID_STATUS')).toThrow(
      'Invalid AdminStatus',
    );
  });

  it('should compare two statuses for equality', () => {
    const status1 = AdminStatus.active();
    const status2 = AdminStatus.active();
    const status3 = AdminStatus.created();

    expect(status1.equals(status2)).toBe(true);
    expect(status1.equals(status3)).toBe(false);
  });
});
