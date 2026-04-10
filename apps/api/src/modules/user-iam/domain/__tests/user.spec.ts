import { User } from '../user';
import { UserCreatedEvent } from '../events/user-created.event';
import { UserUpdatedEvent } from '../events/user-updated.event';
import { UserChangedPasswordEvent } from '../events/user-changed-password.event';
import { CannotChangePasswordHashError } from '../errors';
import { LoginProvider } from '../value-objects/login-provider';
import { UserId } from '../value-objects/user-id';
import { Email } from 'src/shared/value-objects/email';
import { UserName } from '../value-objects/user-name';

describe('User Aggregate', () => {
  const email = 'test@example.com';
  const name = 'John Doe';
  const provider = 'credentials';
  const passwordHash = 'hashedPassword';

  describe('create', () => {
    it('should create a user and apply UserCreatedEvent', () => {
      const user = User.create(email, name, provider, passwordHash);

      expect(user.getEmail().value).toBe(email);
      expect(user.getName().value).toBe(name);
      expect(user.getProvider().value).toBe(provider);
      expect(user.getPasswordHash()).toBe(passwordHash);
      expect(user.getCreatedAt()).toBeInstanceOf(Date);
      expect(user.getUpdatedAt()).toEqual(user.getCreatedAt());

      const events = user.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(UserCreatedEvent);
      expect(events[0]).toEqual(
        expect.objectContaining({
          userId: user.getId().value,
          email,
          name,
          provider,
          createdAt: user.getCreatedAt(),
          updatedAt: user.getUpdatedAt(),
        }),
      );
    });
  });

  describe('update', () => {
    it('should update user name and apply UserUpdatedEvent', () => {
      const user = User.create(email, name, provider, passwordHash);
      const newName = 'Jane Doe';

      // Clear events from creation
      user.commit();

      user.update(newName);

      expect(user.getName().value).toBe(newName);
      expect(user.getUpdatedAt().getTime()).toBeGreaterThanOrEqual(
        user.getCreatedAt().getTime(),
      );

      const events = user.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(UserUpdatedEvent);
      expect(events[0]).toEqual(
        expect.objectContaining({
          userId: user.getId().value,
          email: user.getEmail().value,
          name: newName,
          provider: user.getProvider().value,
          updatedAt: user.getUpdatedAt(),
        }),
      );
    });
  });

  describe('changePassword', () => {
    it('should change password and apply UserChangedPasswordEvent for credentials provider', () => {
      const user = User.create(email, name, provider, passwordHash);
      const newHash = 'newHashedPassword';

      user.commit();

      user.changePassword(newHash);

      expect(user.getPasswordHash()).toBe(newHash);

      const events = user.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(UserChangedPasswordEvent);
      expect(events[0]).toEqual(
        expect.objectContaining({
          userId: user.getId().value,
          updatedAt: user.getUpdatedAt(),
        }),
      );
    });

    it('should throw CannotChangePasswordHashError if provider is not credentials', () => {
      // Mocking LoginProvider to bypass validation for test purposes if needed
      // but here we can try to use constructor of User directly with a fake provider
      const fakeProvider = Object.create(
        LoginProvider.prototype,
      ) as LoginProvider;
      Object.defineProperty(fakeProvider, '_value', { value: 'google' });
      Object.defineProperty(fakeProvider, 'equals', {
        value: (other: LoginProvider) => other.value === 'google',
      });

      const user = User.reconstruct(
        UserId.create(),
        Email.fromString(email),
        UserName.fromString(name),
        fakeProvider,
        new Date(),
        new Date(),
      );

      expect(() => user.changePassword('newHash')).toThrow(
        CannotChangePasswordHashError,
      );
    });
  });
});
