import { AggregateRoot } from '@nestjs/cqrs';
import { UserId } from 'src/modules/user-iam/domain/value-objects/user-id';
import { Email } from 'src/shared/value-objects/email';
import { LoginProvider } from 'src/modules/user-iam/domain/value-objects/login-provider';
import { UserName } from 'src/modules/user-iam/domain/value-objects/user-name';
import { UserCreatedEvent } from 'src/modules/user-iam/domain/events/user-created.event';
import { UserChangedPasswordEvent } from 'src/modules/user-iam/domain/events/user-changed-password.event';
import { UserUpdatedEvent } from 'src/modules/user-iam/domain/events/user-updated.event';
import { CannotChangePasswordHashError } from 'src/modules/user-iam/domain/errors';

export class User extends AggregateRoot {
  private readonly id: UserId;
  private readonly email: Email;
  private name: UserName;
  private passwordHash?: string;
  private readonly provider: LoginProvider;
  private readonly createdAt: Date;
  private updatedAt: Date;

  private constructor(
    id: UserId,
    email: Email,
    name: UserName,
    provider: LoginProvider,
    createdAt: Date,
    updatedAt: Date,
    passwordHash?: string,
  ) {
    super();
    this.id = id;
    this.email = email;
    this.name = name;
    this.passwordHash = passwordHash;
    this.provider = provider;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static reconstruct(
    id: UserId,
    email: Email,
    name: UserName,
    provider: LoginProvider,
    createdAt: Date,
    updatedAt: Date,
    passwordHash?: string,
  ) {
    return new User(
      id,
      email,
      name,
      provider,
      createdAt,
      updatedAt,
      passwordHash,
    );
  }

  static create(
    email: string,
    name: string,
    provider: string,
    passwordHash?: string,
  ) {
    const id = UserId.create();
    const _email = Email.fromString(email);
    const _name = UserName.fromString(name);
    const _provider = LoginProvider.fromString(provider);
    const createdAt = new Date();
    const updatedAt = createdAt;

    const user = new User(
      id,
      _email,
      _name,
      _provider,
      createdAt,
      updatedAt,
      passwordHash,
    );

    user.apply(
      new UserCreatedEvent(
        id.value,
        _email.value,
        _name.value,
        _provider.value,
        createdAt,
        updatedAt,
      ),
    );
    return user;
  }

  update(name: string) {
    this.name = UserName.fromString(name);
    this.updatedAt = new Date();
    this.apply(
      new UserUpdatedEvent(
        this.id.value,
        this.email.value,
        this.name.value,
        this.provider.value,
        this.updatedAt,
      ),
    );
  }

  changePassword(newHash: string) {
    if (!this.provider.equals(LoginProvider.credentials())) {
      throw new CannotChangePasswordHashError();
    }

    this.passwordHash = newHash;
    this.updatedAt = new Date();
    this.apply(new UserChangedPasswordEvent(this.id.value, this.updatedAt));
  }

  getId() {
    return this.id;
  }

  getEmail() {
    return this.email;
  }

  getName() {
    return this.name;
  }

  getPasswordHash() {
    return this.passwordHash;
  }

  getProvider() {
    return this.provider;
  }

  getCreatedAt() {
    return this.createdAt;
  }

  getUpdatedAt() {
    return this.updatedAt;
  }
}
