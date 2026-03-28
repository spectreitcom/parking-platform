import { AggregateRoot } from '@nestjs/cqrs';
import { OrganizationId } from './value-objects/organization-id';
import { OrganizationName } from './value-objects/organization-name';
import { OrganizationAddress } from './value-objects/organization-address';
import { OrganizationTaxId } from './value-objects/organization-tax-id';
import { AggregateVersion } from 'src/shared/value-objects/aggregate-version';
import { OrganizationMember } from './entities/organization-member';
import { OrganizationCreatedEvent } from './events/organization-created.event';
import {
  AddingOrganizationMemberError,
  RemovingOrganizationMemberError,
} from './errors';
import { OrganizationMemberRemovedEvent } from './events/organization-member-removed.event';
import { OrganizationMemberAddedEvent } from './events/organization-member-added.event';
import { OrganizationUpdatedEvent } from './events/organization-updated.event';
import { OrganizationMemberId } from './value-objects/organization-member-id';
import { OrganizationUserId } from './value-objects/organization-user-id';

export class Organization extends AggregateRoot {
  private readonly id: OrganizationId;
  private name: OrganizationName;
  private address: OrganizationAddress;
  private taxId: OrganizationTaxId;
  private version: AggregateVersion;
  private members: OrganizationMember[];

  private constructor(
    id: OrganizationId,
    name: OrganizationName,
    address: OrganizationAddress,
    taxId: OrganizationTaxId,
    version: AggregateVersion,
    members: OrganizationMember[],
  ) {
    super();
    this.id = id;
    this.name = name;
    this.address = address;
    this.taxId = taxId;
    this.version = version;
    this.members = [...members];
  }

  static reconstruct(
    id: OrganizationId,
    name: OrganizationName,
    address: OrganizationAddress,
    taxId: OrganizationTaxId,
    version: AggregateVersion,
    members: OrganizationMember[],
  ) {
    return new Organization(id, name, address, taxId, version, members);
  }

  static create(name: string, address: string, taxId: string) {
    const _id = OrganizationId.create();
    const _name = OrganizationName.fromString(name);
    const _address = OrganizationAddress.fromString(address);
    const _taxId = OrganizationTaxId.fromString(taxId);
    const organization = new Organization(
      _id,
      _name,
      _address,
      _taxId,
      AggregateVersion.one(),
      [],
    );

    organization.apply(
      new OrganizationCreatedEvent(
        _id.value,
        _name.value,
        _address.value,
        _taxId.value,
        [],
        organization.version.value,
      ),
    );

    return organization;
  }

  update(name: string, address: string, taxId: string) {
    this.name = OrganizationName.fromString(name);
    this.address = OrganizationAddress.fromString(address);
    this.taxId = OrganizationTaxId.fromString(taxId);
    this.version = this.version.increment();
    const _nextVersion = this.version;

    this.apply(
      new OrganizationUpdatedEvent(
        this.id.value,
        this.name.value,
        this.address.value,
        this.taxId.value,
        this.members.map((member) => ({
          id: member.id.value,
          isRoot: member.isRoot,
          organizationUserId: member.organizationUserId.value,
        })),
        _nextVersion.value,
      ),
    );
  }

  addMember(isRoot: boolean, organizationUserId: string) {
    const members = [...this.members];
    const member = members.find((member) =>
      member.organizationUserId.equals(
        OrganizationUserId.fromString(organizationUserId),
      ),
    );

    if (member) {
      throw new AddingOrganizationMemberError('Member already exists');
    }

    if (isRoot) {
      const rootMember = members.find((member) => member.isRoot);
      if (rootMember) {
        throw new AddingOrganizationMemberError('Root member already exists');
      }
    }

    const memberId = OrganizationMemberId.create();

    members.push(
      new OrganizationMember(
        memberId,
        isRoot,
        OrganizationUserId.fromString(organizationUserId),
      ),
    );
    this.members = members;

    this.apply(
      new OrganizationMemberAddedEvent(
        this.id.value,
        memberId.value,
        isRoot,
        organizationUserId,
      ),
    );
  }

  removeMember(memberId: string) {
    const members = [...this.members];
    const member = members.find((member) =>
      member.id.equals(OrganizationMemberId.fromString(memberId)),
    );
    if (!member) {
      throw new RemovingOrganizationMemberError('Member not found');
    }
    this.members = members.filter(
      (member) => !member.id.equals(OrganizationMemberId.fromString(memberId)),
    );

    this.apply(new OrganizationMemberRemovedEvent(this.id.value, memberId));
  }

  getId() {
    return this.id;
  }

  getName() {
    return this.name;
  }

  getAddress() {
    return this.address;
  }

  getTaxId() {
    return this.taxId;
  }

  getVersion() {
    return this.version;
  }

  getMembers() {
    return this.members;
  }
}
