import { AggregateRoot } from '@nestjs/cqrs';
import { OrganizationUserId } from './value-objects/organization-user-id';
import { Email } from '../../../shared/value-objects/email';
import { OrganizationUserStatus } from './value-objects/organization-user-status';
import { AggregateVersion } from '../../../shared/value-objects/aggregate-version';
import { OrganizationUserDisplayName } from './value-objects/organization-user-display-name';
import { OrganizationUserUpdatedEvent } from './events/organization-user-updated.event';
import { OrganizationUserActivatedEvent } from './events/organization-user-activated.event';
import { OrganizationUserSuspendedEvent } from './events/organization-user-suspended.event';
import { OrganizationUserInvitedEvent } from './events/organization-user-invited.event';
import { OrganizationUserPasswordChangedEvent } from './events/organization-user-password-changed.event';

export class OrganizationUser extends AggregateRoot {
  private readonly id: OrganizationUserId;
  private readonly email: Email;
  private status: OrganizationUserStatus;
  private readonly version: AggregateVersion;
  private displayName: OrganizationUserDisplayName;
  private passwordHash?: string;
  private readonly createdAt: Date;
  private updatedAt: Date;

  private constructor(
    id: OrganizationUserId,
    email: Email,
    status: OrganizationUserStatus,
    version: AggregateVersion,
    displayName: OrganizationUserDisplayName,
    createdAt: Date,
    updatedAt: Date,
    passwordHash?: string,
  ) {
    super();
    this.id = id;
    this.email = email;
    this.status = status;
    this.version = version;
    this.displayName = displayName;
    this.passwordHash = passwordHash;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static reconstruct(
    id: OrganizationUserId,
    email: Email,
    status: OrganizationUserStatus,
    version: AggregateVersion,
    displayName: OrganizationUserDisplayName,
    createdAt: Date,
    updatedAt: Date,
    passwordHash?: string,
  ) {
    return new OrganizationUser(
      id,
      email,
      status,
      version,
      displayName,
      createdAt,
      updatedAt,
      passwordHash,
    );
  }

  static invite(email: string, displayName: string) {
    const id = OrganizationUserId.create();
    const emailVO = Email.fromString(email);
    const status = OrganizationUserStatus.invited();
    const version = AggregateVersion.one();
    const displayNameVO = OrganizationUserDisplayName.fromString(displayName);
    const createdAt = new Date();

    const organizationUser = new OrganizationUser(
      id,
      emailVO,
      status,
      version,
      displayNameVO,
      createdAt,
      createdAt,
      undefined,
    );

    organizationUser.apply(
      new OrganizationUserInvitedEvent(
        id.value,
        emailVO.value,
        status.value,
        displayNameVO.value,
        version.value,
        createdAt,
        createdAt,
        undefined,
      ),
    );

    return organizationUser;
  }

  update(displayName: string) {
    this.displayName = OrganizationUserDisplayName.fromString(displayName);
    this.updatedAt = new Date();
    this.apply(
      new OrganizationUserUpdatedEvent(
        this.id.value,
        this.displayName.value,
        this.updatedAt,
      ),
    );
  }

  activate() {
    this.status = OrganizationUserStatus.active();
    this.updatedAt = new Date();
    this.apply(new OrganizationUserActivatedEvent(this.id.value));
  }

  suspense() {
    this.status = OrganizationUserStatus.suspended();
    this.updatedAt = new Date();
    this.apply(new OrganizationUserSuspendedEvent(this.id.value));
  }

  changePassword(passwordHash: string) {
    this.passwordHash = passwordHash;
    this.updatedAt = new Date();
    this.apply(new OrganizationUserPasswordChangedEvent(this.id.value));
  }

  getId() {
    return this.id;
  }

  getEmail() {
    return this.email;
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

  getDisplayName() {
    return this.displayName;
  }

  getCreatedAt() {
    return this.createdAt;
  }

  getUpdatedAt() {
    return this.updatedAt;
  }
}
