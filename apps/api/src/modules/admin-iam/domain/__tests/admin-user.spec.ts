import { AdminUser } from '../admin-user';
import { AdminId } from '../value-objects/admin-id';
import { Email } from 'src/shared/value-objects/email';
import { AdminDisplayName } from '../value-objects/admin-display-name';
import { AdminStatus } from '../value-objects/admin-status';
import { AggregateVersion } from 'src/shared/value-objects/aggregate-version';
import { AdminUserCreatedEvent } from '../events/admin-user-created.event';
import { AdminUserUpdatedEvent } from '../events/admin-user-updated.event';
import { AdminUserSuspendedEvent } from '../events/admin-user-suspended.event';
import { AdminUserActivatedEvent } from '../events/admin-user-activated.event';
import { AdminUserInvitedEvent } from '../events/admin-user-invited.event';
import { AdminUserPasswordChangedEvent } from '../events/admin-user-password-changed.event';

describe('AdminUser', () => {
  const emailValue = 'test@example.com';
  const displayNameValue = 'John Doe';
  const passwordHash = 'hashedPassword';

  describe('reconstruct', () => {
    it('should reconstruct an AdminUser aggregate', () => {
      const id = AdminId.create();
      const email = Email.fromString(emailValue);
      const isSuperAdmin = false;
      const displayName = AdminDisplayName.fromString(displayNameValue);
      const status = AdminStatus.active();
      const version = AggregateVersion.one();
      const createdAt = new Date();
      const updatedAt = new Date();

      const adminUser = AdminUser.reconstruct(
        id,
        email,
        isSuperAdmin,
        displayName,
        status,
        version,
        createdAt,
        updatedAt,
        passwordHash,
      );

      expect(adminUser.getId()).toBe(id);
      expect(adminUser.getEmail()).toBe(email);
      expect(adminUser.getIsSuperAdmin()).toBe(isSuperAdmin);
      expect(adminUser.getDisplayName()).toBe(displayName);
      expect(adminUser.getStatus()).toBe(status);
      expect(adminUser.getVersion()).toBe(version);
      expect(adminUser.getCreatedAt()).toBe(createdAt);
      expect(adminUser.getUpdatedAt()).toBe(updatedAt);
      expect(adminUser.getPasswordHash()).toBe(passwordHash);
    });
  });

  describe('invite', () => {
    it('should create an invited AdminUser and apply AdminUserInvitedEvent', () => {
      const beforeCreation = new Date();
      const adminUser = AdminUser.invite(emailValue, displayNameValue);
      const afterCreation = new Date();

      expect(adminUser.getEmail().value).toBe(emailValue);
      expect(adminUser.getDisplayName().value).toBe(displayNameValue);
      expect(adminUser.getIsSuperAdmin()).toBe(false);
      expect(adminUser.getStatus().value).toBe(AdminStatus.invited().value);
      expect(adminUser.getVersion().value).toBe(1);
      expect(adminUser.getCreatedAt().getTime()).toBeGreaterThanOrEqual(
        beforeCreation.getTime(),
      );
      expect(adminUser.getCreatedAt().getTime()).toBeLessThanOrEqual(
        afterCreation.getTime(),
      );
      expect(adminUser.getUpdatedAt()).toEqual(adminUser.getCreatedAt());

      const events = adminUser.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(AdminUserInvitedEvent);

      const event = events[0] as AdminUserInvitedEvent;
      expect(event.id).toBe(adminUser.getId().value);
      expect(event.email).toBe(emailValue);
      expect(event.isSuperAdmin).toBe(false);
      expect(event.displayName).toBe(displayNameValue);
      expect(event.status).toBe(AdminStatus.invited().value);
    });

    it('should throw if email is invalid', () => {
      expect(() =>
        AdminUser.invite('invalid-email', displayNameValue),
      ).toThrow();
    });

    it('should throw if display name is too long', () => {
      const longName = 'a'.repeat(121);
      expect(() => AdminUser.invite(emailValue, longName)).toThrow();
    });
  });

  describe('createSuperAdmin', () => {
    it('should create a super admin AdminUser and apply AdminUserCreatedEvent', () => {
      const beforeCreation = new Date();
      const adminUser = AdminUser.createSuperAdmin(
        emailValue,
        displayNameValue,
        passwordHash,
      );
      const afterCreation = new Date();

      expect(adminUser.getEmail().value).toBe(emailValue);
      expect(adminUser.getDisplayName().value).toBe(displayNameValue);
      expect(adminUser.getIsSuperAdmin()).toBe(true);
      expect(adminUser.getStatus().value).toBe(AdminStatus.active().value);
      expect(adminUser.getPasswordHash()).toBe(passwordHash);
      expect(adminUser.getCreatedAt().getTime()).toBeGreaterThanOrEqual(
        beforeCreation.getTime(),
      );
      expect(adminUser.getCreatedAt().getTime()).toBeLessThanOrEqual(
        afterCreation.getTime(),
      );
      expect(adminUser.getUpdatedAt()).toEqual(adminUser.getCreatedAt());

      const events = adminUser.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(AdminUserCreatedEvent);

      const event = events[0] as AdminUserCreatedEvent;
      expect(event.id).toBe(adminUser.getId().value);
      expect(event.email).toBe(emailValue);
      expect(event.isSuperAdmin).toBe(true);
      expect(event.displayName).toBe(displayNameValue);
      expect(event.status).toBe(AdminStatus.active().value);
    });
  });

  describe('update', () => {
    it('should update display name and apply AdminUserUpdatedEvent', () => {
      const adminUser = AdminUser.invite(emailValue, 'Old Name');
      const oldUpdatedAt = adminUser.getUpdatedAt();
      const newDisplayName = 'New Name';

      const beforeUpdate = new Date();
      adminUser.update(newDisplayName);
      const afterUpdate = new Date();

      expect(adminUser.getDisplayName().value).toBe(newDisplayName);
      expect(adminUser.getUpdatedAt().getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime(),
      );
      expect(adminUser.getUpdatedAt().getTime()).toBeLessThanOrEqual(
        afterUpdate.getTime(),
      );
      expect(adminUser.getUpdatedAt().getTime()).toBeGreaterThanOrEqual(
        oldUpdatedAt.getTime(),
      );

      const events = adminUser.getUncommittedEvents();
      // event from invite + event from update
      expect(events).toHaveLength(2);
      expect(events[1]).toBeInstanceOf(AdminUserUpdatedEvent);

      const event = events[1] as AdminUserUpdatedEvent;
      expect(event.displayName).toBe(newDisplayName);
      expect(event.updatedAt).toEqual(adminUser.getUpdatedAt());
    });
  });

  describe('suspense', () => {
    it('should suspend AdminUser and apply AdminUserSuspendedEvent', () => {
      const adminUser = AdminUser.createSuperAdmin(
        emailValue,
        displayNameValue,
        passwordHash,
      );
      const oldUpdatedAt = adminUser.getUpdatedAt();

      const beforeUpdate = new Date();
      adminUser.suspense();
      const afterUpdate = new Date();

      expect(adminUser.getStatus().value).toBe(AdminStatus.suspended().value);
      expect(adminUser.getUpdatedAt().getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime(),
      );
      expect(adminUser.getUpdatedAt().getTime()).toBeLessThanOrEqual(
        afterUpdate.getTime(),
      );
      expect(adminUser.getUpdatedAt().getTime()).toBeGreaterThanOrEqual(
        oldUpdatedAt.getTime(),
      );

      const events = adminUser.getUncommittedEvents();
      expect(events).toHaveLength(2);
      expect(events[1]).toBeInstanceOf(AdminUserSuspendedEvent);

      const event = events[1] as AdminUserSuspendedEvent;
      expect(event.id).toBe(adminUser.getId().value);
      expect(event.updatedAt).toEqual(adminUser.getUpdatedAt());
    });
  });

  describe('activate', () => {
    it('should activate AdminUser and apply AdminUserActivatedEvent', () => {
      const adminUser = AdminUser.invite(emailValue, displayNameValue);
      const oldUpdatedAt = adminUser.getUpdatedAt();
      // Ensure it's not active already (it is invited)
      expect(adminUser.getStatus().value).toBe(AdminStatus.invited().value);

      const beforeUpdate = new Date();
      adminUser.activate();
      const afterUpdate = new Date();

      expect(adminUser.getStatus().value).toBe(AdminStatus.active().value);
      expect(adminUser.getUpdatedAt().getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime(),
      );
      expect(adminUser.getUpdatedAt().getTime()).toBeLessThanOrEqual(
        afterUpdate.getTime(),
      );
      expect(adminUser.getUpdatedAt().getTime()).toBeGreaterThanOrEqual(
        oldUpdatedAt.getTime(),
      );

      const events = adminUser.getUncommittedEvents();
      expect(events).toHaveLength(2);
      expect(events[1]).toBeInstanceOf(AdminUserActivatedEvent);

      const event = events[1] as AdminUserActivatedEvent;
      expect(event.id).toBe(adminUser.getId().value);
      expect(event.updatedAt).toEqual(adminUser.getUpdatedAt());
    });
  });

  describe('changePassword', () => {
    it('should change password hash and apply AdminUserPasswordChangedEvent', () => {
      const adminUser = AdminUser.createSuperAdmin(
        emailValue,
        displayNameValue,
        'oldHash',
      );
      const oldUpdatedAt = adminUser.getUpdatedAt();
      const newHash = 'newHash';

      const beforeUpdate = new Date();
      adminUser.changePassword(newHash);
      const afterUpdate = new Date();

      expect(adminUser.getPasswordHash()).toBe(newHash);
      expect(adminUser.getUpdatedAt().getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime(),
      );
      expect(adminUser.getUpdatedAt().getTime()).toBeLessThanOrEqual(
        afterUpdate.getTime(),
      );
      expect(adminUser.getUpdatedAt().getTime()).toBeGreaterThanOrEqual(
        oldUpdatedAt.getTime(),
      );

      const events = adminUser.getUncommittedEvents();
      expect(events).toHaveLength(2);
      expect(events[1]).toBeInstanceOf(AdminUserPasswordChangedEvent);

      const event = events[1] as AdminUserPasswordChangedEvent;
      expect(event.id).toBe(adminUser.getId().value);
      expect(event.updatedAt).toEqual(adminUser.getUpdatedAt());
    });
  });
});
