import { OrganizationUser } from '../organization-user';
import { OrganizationUserCreatedEvent } from '../events/organization-user-created.event';
import { OrganizationUserUpdatedEvent } from '../events/organization-user-updated.event';
import { OrganizationUserActivatedEvent } from '../events/organization-user-activated.event';
import { OrganizationUserSuspendedEvent } from '../events/organization-user-suspended.event';
import { OrganizationUserInvitedEvent } from '../events/organization-user-invited.event';
import { OrganizationUserPasswordChangedEvent } from '../events/organization-user-password-changed.event';
import {
  ORGANIZATION_USER_ACTIVE,
  ORGANIZATION_USER_CREATED,
  ORGANIZATION_USER_INVITED,
  ORGANIZATION_USER_SUSPENDED,
} from '../constants';
import { AppError } from '../../../../shared/errors';

describe('OrganizationUser', () => {
  const email = 'test@example.com';
  const displayName = 'Test User';
  const passwordHash = 'hash123';

  it('should create an organization user', () => {
    const user = OrganizationUser.create(email, displayName, passwordHash);

    expect(user.getId()).toBeDefined();
    expect(user.getEmail().value).toBe(email);
    expect(user.getDisplayName().value).toBe(displayName);
    expect(user.getPasswordHash()).toBe(passwordHash);
    expect(user.getStatus().value).toBe(ORGANIZATION_USER_CREATED);
    expect(user.getVersion().value).toBe(1);

    const events = user.getUncommittedEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(OrganizationUserCreatedEvent);
    const event = events[0] as OrganizationUserCreatedEvent;
    expect(event.organizationUserId).toBe(user.getId().value);
    expect(event.email).toBe(email);
    expect(event.displayName).toBe(displayName);
    expect(event.passwordHash).toBe(passwordHash);
  });

  it('should throw error when creating with invalid email', () => {
    expect(() => OrganizationUser.create('invalid-email', displayName)).toThrow(
      AppError,
    );
  });

  it('should throw error when creating with empty display name', () => {
    expect(() => OrganizationUser.create(email, '')).toThrow(AppError);
  });

  it('should update display name', () => {
    const user = OrganizationUser.create(email, displayName);
    const newDisplayName = 'Updated Name';

    user.update(newDisplayName);

    expect(user.getDisplayName().value).toBe(newDisplayName);
    const events = user.getUncommittedEvents();
    expect(events).toHaveLength(2);
    expect(events[1]).toBeInstanceOf(OrganizationUserUpdatedEvent);
    expect((events[1] as OrganizationUserUpdatedEvent).displayName).toBe(
      newDisplayName,
    );
  });

  it('should activate user', () => {
    const user = OrganizationUser.create(email, displayName);
    user.activate();

    expect(user.getStatus().value).toBe(ORGANIZATION_USER_ACTIVE);
    const events = user.getUncommittedEvents();
    expect(events[1]).toBeInstanceOf(OrganizationUserActivatedEvent);
  });

  it('should suspend user', () => {
    const user = OrganizationUser.create(email, displayName);
    user.suspense();

    expect(user.getStatus().value).toBe(ORGANIZATION_USER_SUSPENDED);
    const events = user.getUncommittedEvents();
    expect(events[1]).toBeInstanceOf(OrganizationUserSuspendedEvent);
  });

  it('should invite user', () => {
    const user = OrganizationUser.create(email, displayName);
    user.invite();

    expect(user.getStatus().value).toBe(ORGANIZATION_USER_INVITED);
    const events = user.getUncommittedEvents();
    expect(events[1]).toBeInstanceOf(OrganizationUserInvitedEvent);
  });

  it('should change password', () => {
    const user = OrganizationUser.create(email, displayName);
    const newPasswordHash = 'newhash';
    user.changePassword(newPasswordHash);

    expect(user.getPasswordHash()).toBe(newPasswordHash);
    const events = user.getUncommittedEvents();
    expect(events[1]).toBeInstanceOf(OrganizationUserPasswordChangedEvent);
  });
});
