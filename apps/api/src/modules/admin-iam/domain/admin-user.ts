import { AggregateRoot } from '@nestjs/cqrs';
import { AdminId } from './value-objects/admin-id';
import { Email } from 'src/shared/value-objects/email';
import { AdminDisplayName } from './value-objects/admin-display-name';
import { AdminStatus } from './value-objects/admin-status';
import { AggregateVersion } from 'src/shared/value-objects/aggregate-version';
import { AdminUserCreatedEvent } from './events/admin-user-created.event';
import { AdminUserUpdatedEvent } from './events/admin-user-updated.event';
import { AdminUserSuspendedEvent } from './events/admin-user-suspended.event';
import { AdminUserActivatedEvent } from './events/admin-user-activated.event';
import { AdminUserInvitedEvent } from './events/admin-user-invited.event';
import { AdminUserPasswordChangedEvent } from './events/admin-user-password-changed.event';

export class AdminUser extends AggregateRoot {
  private readonly id: AdminId;
  private readonly email: Email;
  private readonly isSuperAdmin: boolean;
  private displayName: AdminDisplayName;
  private status: AdminStatus;
  private readonly version: AggregateVersion;
  private passwordHash?: string;
  private readonly createdAt: Date;
  private updatedAt: Date;

  private constructor(
    id: AdminId,
    email: Email,
    isSuperAdmin: boolean,
    displayName: AdminDisplayName,
    status: AdminStatus,
    version: AggregateVersion,
    createdAt: Date,
    updatedAt: Date,
    passwordHash?: string,
  ) {
    super();
    this.id = id;
    this.email = email;
    this.isSuperAdmin = isSuperAdmin;
    this.displayName = displayName;
    this.status = status;
    this.version = version;
    this.passwordHash = passwordHash;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static reconstruct(
    id: AdminId,
    email: Email,
    isSuperAdmin: boolean,
    displayName: AdminDisplayName,
    status: AdminStatus,
    version: AggregateVersion,
    createdAt: Date,
    updatedAt: Date,
    passwordHash?: string,
  ) {
    return new AdminUser(
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
  }

  static invite(email: string, displayName: string) {
    const id = AdminId.create();
    const _email = Email.fromString(email);
    const _displayName = AdminDisplayName.fromString(displayName);
    const _status = AdminStatus.invited();
    const _createdAt = new Date();

    const adminUser = new AdminUser(
      id,
      _email,
      false,
      _displayName,
      _status,
      AggregateVersion.one(),
      _createdAt,
      _createdAt,
    );

    adminUser.apply(
      new AdminUserInvitedEvent(
        id.value,
        _email.value,
        false,
        _displayName.value,
        _status.value,
        _createdAt,
        _createdAt,
      ),
    );

    return adminUser;
  }

  static createSuperAdmin(
    email: string,
    displayName: string,
    passwordHash: string,
  ) {
    const id = AdminId.create();
    const _email = Email.fromString(email);
    const _displayName = AdminDisplayName.fromString(displayName);
    const _status = AdminStatus.active();
    const _createdAt = new Date();

    const adminUser = new AdminUser(
      id,
      _email,
      true,
      _displayName,
      _status,
      AggregateVersion.one(),
      _createdAt,
      _createdAt,
      passwordHash,
    );
    adminUser.apply(
      new AdminUserCreatedEvent(
        id.value,
        _email.value,
        true,
        _displayName.value,
        _status.value,
        _createdAt,
        _createdAt,
      ),
    );
    return adminUser;
  }

  update(displayName: string) {
    this.displayName = AdminDisplayName.fromString(displayName);
    this.updatedAt = new Date();

    this.apply(
      new AdminUserUpdatedEvent(
        this.id.value,
        this.email.value,
        this.isSuperAdmin,
        this.displayName.value,
        this.status.value,
        this.updatedAt,
      ),
    );
  }

  suspense() {
    this.status = AdminStatus.suspended();
    this.updatedAt = new Date();
    this.apply(new AdminUserSuspendedEvent(this.id.value, this.updatedAt));
  }

  activate() {
    this.status = AdminStatus.active();
    this.updatedAt = new Date();
    this.apply(new AdminUserActivatedEvent(this.id.value, this.updatedAt));
  }

  changePassword(newHash: string) {
    this.passwordHash = newHash;
    this.updatedAt = new Date();
    this.apply(
      new AdminUserPasswordChangedEvent(this.id.value, this.updatedAt),
    );
  }

  getId() {
    return this.id;
  }

  getEmail() {
    return this.email;
  }

  getIsSuperAdmin() {
    return this.isSuperAdmin;
  }

  getDisplayName() {
    return this.displayName;
  }

  getStatus() {
    return this.status;
  }

  getVersion() {
    return this.version;
  }

  getPasswordHash() {
    return this.passwordHash;
  }

  getCreatedAt() {
    return this.createdAt;
  }

  getUpdatedAt() {
    return this.updatedAt;
  }
}
