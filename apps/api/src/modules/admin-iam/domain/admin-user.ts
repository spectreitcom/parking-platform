import { AggregateRoot } from '@nestjs/cqrs';
import { AdminId } from './value-objects/admin-id';
import { Email } from '../../../shared/value-objects/email';
import { AdminDisplayName } from './value-objects/admin-display-name';
import { AdminStatus } from './value-objects/admin-status';
import { AggregateVersion } from '../../../shared/value-objects/aggregate-version';
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

  constructor(
    id: AdminId,
    email: Email,
    isSuperAdmin: boolean,
    displayName: AdminDisplayName,
    status: AdminStatus,
    version: AggregateVersion,
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
  }

  static create(email: string, displayName: string, isSuperAdmin = false) {
    const id = AdminId.create();
    const _email = Email.fromString(email);
    const _displayName = AdminDisplayName.fromString(displayName);
    const _status = AdminStatus.created();

    const adminUser = new AdminUser(
      id,
      _email,
      isSuperAdmin,
      _displayName,
      _status,
      AggregateVersion.one(),
    );

    adminUser.apply(
      new AdminUserCreatedEvent(
        id.value,
        _email.value,
        isSuperAdmin,
        _displayName.value,
        _status.value,
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
    const adminUser = new AdminUser(
      id,
      _email,
      true,
      _displayName,
      _status,
      AggregateVersion.one(),
      passwordHash,
    );
    adminUser.apply(
      new AdminUserCreatedEvent(
        id.value,
        _email.value,
        true,
        _displayName.value,
        _status.value,
      ),
    );
    return adminUser;
  }

  update(displayName: string) {
    this.displayName = AdminDisplayName.fromString(displayName);
    this.apply(
      new AdminUserUpdatedEvent(
        this.id.value,
        this.email.value,
        this.isSuperAdmin,
        this.displayName.value,
        this.status.value,
      ),
    );
  }

  suspense() {
    this.status = AdminStatus.suspended();
    this.apply(new AdminUserSuspendedEvent(this.id.value));
  }

  activate() {
    this.status = AdminStatus.active();
    this.apply(new AdminUserActivatedEvent(this.id.value));
  }

  invite() {
    this.status = AdminStatus.invited();
    this.apply(new AdminUserInvitedEvent(this.id.value));
  }

  changePassword(newHash: string) {
    this.passwordHash = newHash;
    this.apply(new AdminUserPasswordChangedEvent(this.id.value));
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
}
