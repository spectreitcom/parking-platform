import { AdminUser } from '../admin-user';
import { AdminUserCreatedEvent } from '../events/admin-user-created.event';
import { AdminUserUpdatedEvent } from '../events/admin-user-updated.event';
import { AdminUserSuspendedEvent } from '../events/admin-user-suspended.event';
import { AdminUserActivatedEvent } from '../events/admin-user-activated.event';
import { AdminUserInvitedEvent } from '../events/admin-user-invited.event';
import { AdminUserPasswordChangedEvent } from '../events/admin-user-password-changed.event';

describe('AdminUser', () => {
  const email = 'test@example.com';
  const displayName = 'Test Admin';

  it('should create an admin user aggregate', () => {
    const adminUser = AdminUser.create(email, displayName, true);

    expect(adminUser.getId()).toBeDefined();
    expect(adminUser.getEmail().value).toBe(email);
    expect(adminUser.getDisplayName().value).toBe(displayName);
    expect(adminUser.getIsSuperAdmin()).toBe(true);
    expect(adminUser.getStatus().value).toBe('CREATED');

    const events = adminUser.getUncommittedEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(AdminUserCreatedEvent);
    expect(events[0]).toEqual(
      new AdminUserCreatedEvent(
        adminUser.getId().value,
        email,
        true,
        displayName,
        'CREATED',
      ),
    );
  });

  it('should update admin user display name', () => {
    const adminUser = AdminUser.create(email, displayName);
    const newDisplayName = 'Updated Name';

    adminUser.update(newDisplayName);

    expect(adminUser.getDisplayName().value).toBe(newDisplayName);

    const events = adminUser.getUncommittedEvents();
    expect(events[1]).toBeInstanceOf(AdminUserUpdatedEvent);
    expect(events[1]).toEqual(
      new AdminUserUpdatedEvent(
        adminUser.getId().value,
        email,
        false,
        newDisplayName,
        'CREATED',
      ),
    );
  });

  it('should suspend admin user', () => {
    const adminUser = AdminUser.create(email, displayName);
    adminUser.suspense();

    expect(adminUser.getStatus().value).toBe('SUSPENDED');

    const events = adminUser.getUncommittedEvents();
    expect(events[1]).toBeInstanceOf(AdminUserSuspendedEvent);
    expect(events[1]).toEqual(
      new AdminUserSuspendedEvent(adminUser.getId().value),
    );
  });

  it('should activate admin user', () => {
    const adminUser = AdminUser.create(email, displayName);
    adminUser.activate();

    expect(adminUser.getStatus().value).toBe('ACTIVE');

    const events = adminUser.getUncommittedEvents();
    expect(events[1]).toBeInstanceOf(AdminUserActivatedEvent);
    expect(events[1]).toEqual(
      new AdminUserActivatedEvent(adminUser.getId().value),
    );
  });

  it('should invite admin user', () => {
    const adminUser = AdminUser.create(email, displayName);
    adminUser.invite();

    expect(adminUser.getStatus().value).toBe('INVITED');

    const events = adminUser.getUncommittedEvents();
    expect(events[1]).toBeInstanceOf(AdminUserInvitedEvent);
    expect(events[1]).toEqual(
      new AdminUserInvitedEvent(adminUser.getId().value),
    );
  });

  it('should change admin user password hash', () => {
    const adminUser = AdminUser.create(email, displayName);
    const newHash = 'new-password-hash';

    adminUser.changePassword(newHash);

    expect(adminUser.getPasswordHash()).toBe(newHash);

    const events = adminUser.getUncommittedEvents();
    expect(events[1]).toBeInstanceOf(AdminUserPasswordChangedEvent);
    expect(events[1]).toEqual(
      new AdminUserPasswordChangedEvent(adminUser.getId().value),
    );
  });
});
