import { AdminUser } from '../admin-user';
import { AdminUserCreatedEvent } from '../events/admin-user-created.event';
import { AdminUserUpdatedEvent } from '../events/admin-user-updated.event';
import { AdminUserSuspendedEvent } from '../events/admin-user-suspended.event';
import { AdminUserActivatedEvent } from '../events/admin-user-activated.event';
import { AdminUserInvitedEvent } from '../events/admin-user-invited.event';
import { AdminUserPasswordChangedEvent } from '../events/admin-user-password-changed.event';
import {
  ADMIN_ACTIVE,
  ADMIN_CREATED,
  ADMIN_INVITED,
  ADMIN_SUSPENDED,
} from '../constants';

describe('AdminUser', () => {
  const email = 'test@example.com';
  const displayName = 'Test Admin';
  const passwordHash = 'hashed_password';

  describe('create', () => {
    it('should create a new admin user', () => {
      const admin = AdminUser.create(email, displayName);

      expect(admin.getId()).toBeDefined();
      expect(admin.getEmail().value).toBe(email);
      expect(admin.getDisplayName().value).toBe(displayName);
      expect(admin.getIsSuperAdmin()).toBe(false);
      expect(admin.getStatus().value).toBe(ADMIN_CREATED);
      expect(admin.getVersion().value).toBe(1);
      expect(admin.getCreatedAt()).toBeInstanceOf(Date);
      expect(admin.getUpdatedAt()).toBeInstanceOf(Date);

      const events = admin.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(AdminUserCreatedEvent);
      const event = events[0] as AdminUserCreatedEvent;
      expect(event.id).toBe(admin.getId().value);
      expect(event.email).toBe(email);
      expect(event.displayName).toBe(displayName);
      expect(event.isSuperAdmin).toBe(false);
      expect(event.status).toBe(ADMIN_CREATED);
    });

    it('should create a new super admin user using create factory with flag', () => {
      const admin = AdminUser.create(email, displayName, true);

      expect(admin.getIsSuperAdmin()).toBe(true);

      const events = admin.getUncommittedEvents();
      const event = events[0] as AdminUserCreatedEvent;
      expect(event.isSuperAdmin).toBe(true);
    });
  });

  describe('createSuperAdmin', () => {
    it('should create a super admin with password hash', () => {
      const admin = AdminUser.createSuperAdmin(
        email,
        displayName,
        passwordHash,
      );

      expect(admin.getId()).toBeDefined();
      expect(admin.getEmail().value).toBe(email);
      expect(admin.getDisplayName().value).toBe(displayName);
      expect(admin.getIsSuperAdmin()).toBe(true);
      expect(admin.getStatus().value).toBe(ADMIN_ACTIVE);
      expect(admin.getPasswordHash()).toBe(passwordHash);

      const events = admin.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(AdminUserCreatedEvent);
      const event = events[0] as AdminUserCreatedEvent;
      expect(event.isSuperAdmin).toBe(true);
      expect(event.status).toBe(ADMIN_ACTIVE);
    });
  });

  describe('update', () => {
    it('should update display name', () => {
      const admin = AdminUser.create(email, displayName);
      const newDisplayName = 'Updated Name';

      // Clear events from creation
      admin.commit();

      admin.update(newDisplayName);

      expect(admin.getDisplayName().value).toBe(newDisplayName);
      expect(admin.getUpdatedAt()).toBeInstanceOf(Date);

      const events = admin.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(AdminUserUpdatedEvent);
      const event = events[0] as AdminUserUpdatedEvent;
      expect(event.displayName).toBe(newDisplayName);
    });
  });

  describe('suspense', () => {
    it('should suspend admin user', () => {
      const admin = AdminUser.create(email, displayName);
      admin.commit();

      admin.suspense();

      expect(admin.getStatus().value).toBe(ADMIN_SUSPENDED);

      const events = admin.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(AdminUserSuspendedEvent);
    });
  });

  describe('activate', () => {
    it('should activate admin user', () => {
      const admin = AdminUser.create(email, displayName);
      admin.commit();

      admin.activate();

      expect(admin.getStatus().value).toBe(ADMIN_ACTIVE);

      const events = admin.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(AdminUserActivatedEvent);
    });
  });

  describe('invite', () => {
    it('should invite admin user', () => {
      const admin = AdminUser.create(email, displayName);
      admin.commit();

      admin.invite();

      expect(admin.getStatus().value).toBe(ADMIN_INVITED);

      const events = admin.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(AdminUserInvitedEvent);
    });
  });

  describe('changePassword', () => {
    it('should change admin password', () => {
      const admin = AdminUser.create(email, displayName);
      const newPasswordHash = 'new_hash';
      admin.commit();

      admin.changePassword(newPasswordHash);

      expect(admin.getPasswordHash()).toBe(newPasswordHash);

      const events = admin.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(AdminUserPasswordChangedEvent);
    });
  });
});
