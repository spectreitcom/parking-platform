import { OrganizationUser } from '../organization-user';
import { OrganizationUserInvitedEvent } from '../events/organization-user-invited.event';
import { OrganizationUserUpdatedEvent } from '../events/organization-user-updated.event';
import { OrganizationUserActivatedEvent } from '../events/organization-user-activated.event';
import { OrganizationUserSuspendedEvent } from '../events/organization-user-suspended.event';
import { OrganizationUserPasswordChangedEvent } from '../events/organization-user-password-changed.event';
import {
  ORGANIZATION_USER_INVITED,
  ORGANIZATION_USER_ACTIVE,
  ORGANIZATION_USER_SUSPENDED,
} from '../constants';

describe('OrganizationUser', () => {
  const email = 'test@example.com';
  const displayName = 'Test User';

  describe('invite', () => {
    it('should create a new organization user and apply OrganizationUserInvitedEvent', () => {
      const user = OrganizationUser.invite(email, displayName);

      expect(user.getId()).toBeDefined();
      expect(user.getEmail().value).toBe(email);
      expect(user.getDisplayName().value).toBe(displayName);
      expect(user.getStatus().value).toBe(ORGANIZATION_USER_INVITED);
      expect(user.getVersion().value).toBe(1);
      expect(user.getCreatedAt()).toBeInstanceOf(Date);
      expect(user.getUpdatedAt()).toBeInstanceOf(Date);
      expect(user.getPasswordHash()).toBeUndefined();

      const events = user.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(OrganizationUserInvitedEvent);

      const event = events[0] as OrganizationUserInvitedEvent;
      expect(event.organizationUserId).toBe(user.getId().value);
      expect(event.email).toBe(email);
      expect(event.displayName).toBe(displayName);
      expect(event.status).toBe(ORGANIZATION_USER_INVITED);
      expect(event.version).toBe(1);
    });
  });

  describe('update', () => {
    it('should update display name, increment version and apply OrganizationUserUpdatedEvent', () => {
      const user = OrganizationUser.invite(email, displayName);
      const newDisplayName = 'Updated Name';
      const initialUpdatedAt = user.getUpdatedAt();

      user.update(newDisplayName);

      expect(user.getDisplayName().value).toBe(newDisplayName);
      expect(user.getUpdatedAt().getTime()).toBeGreaterThanOrEqual(
        initialUpdatedAt.getTime(),
      );

      const events = user.getUncommittedEvents();
      // 1 from invite, 1 from update
      expect(events).toHaveLength(2);
      expect(events[1]).toBeInstanceOf(OrganizationUserUpdatedEvent);

      const event = events[1] as OrganizationUserUpdatedEvent;
      expect(event.organizationUserId).toBe(user.getId().value);
      expect(event.displayName).toBe(newDisplayName);
      expect(event.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('activate', () => {
    it('should change status to active, increment version and apply OrganizationUserActivatedEvent', () => {
      const user = OrganizationUser.invite(email, displayName);

      user.activate();

      expect(user.getStatus().value).toBe(ORGANIZATION_USER_ACTIVE);

      const events = user.getUncommittedEvents();
      expect(events).toHaveLength(2);
      expect(events[1]).toBeInstanceOf(OrganizationUserActivatedEvent);

      const event = events[1] as OrganizationUserActivatedEvent;
      expect(event.organizationUserId).toBe(user.getId().value);
    });
  });

  describe('suspense', () => {
    it('should change status to suspended, increment version and apply OrganizationUserSuspendedEvent', () => {
      const user = OrganizationUser.invite(email, displayName);

      user.suspense();

      expect(user.getStatus().value).toBe(ORGANIZATION_USER_SUSPENDED);

      const events = user.getUncommittedEvents();
      expect(events).toHaveLength(2);
      expect(events[1]).toBeInstanceOf(OrganizationUserSuspendedEvent);

      const event = events[1] as OrganizationUserSuspendedEvent;
      expect(event.organizationUserId).toBe(user.getId().value);
    });
  });

  describe('changePassword', () => {
    it('should update password hash, increment version and apply OrganizationUserPasswordChangedEvent', () => {
      const user = OrganizationUser.invite(email, displayName);
      const newPasswordHash = 'hashedpassword123';

      user.changePassword(newPasswordHash);

      expect(user.getPasswordHash()).toBe(newPasswordHash);

      const events = user.getUncommittedEvents();
      expect(events).toHaveLength(2);
      expect(events[1]).toBeInstanceOf(OrganizationUserPasswordChangedEvent);

      const event = events[1] as OrganizationUserPasswordChangedEvent;
      expect(event.organizationUserId).toBe(user.getId().value);
    });
  });
});
