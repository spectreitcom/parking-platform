import { Organization } from '../organization';
import { OrganizationCreatedEvent } from '../events/organization-created.event';
import { OrganizationUpdatedEvent } from '../events/organization-updated.event';
import { OrganizationMemberAddedEvent } from '../events/organization-member-added.event';
import { OrganizationMemberRemovedEvent } from '../events/organization-member-removed.event';
import {
  AddingOrganizationMemberError,
  RemovingOrganizationMemberError,
} from '../errors';
import { randomUUID } from 'node:crypto';

describe('Organization', () => {
  it('should create an organization', () => {
    const name = 'Test Org';
    const address = 'Test Address';
    const taxId = '1234567890';

    const organization = Organization.create(name, address, taxId);

    expect(organization.getId()).toBeDefined();
    expect(organization.getName().value).toBe(name);
    expect(organization.getAddress().value).toBe(address);
    expect(organization.getTaxId().value).toBe(taxId);
    expect(organization.getVersion().value).toBe(1);
    expect(organization.getMembers()).toHaveLength(0);

    const uncommittedEvents = organization.getUncommittedEvents();
    expect(uncommittedEvents).toHaveLength(1);
    expect(uncommittedEvents[0]).toBeInstanceOf(OrganizationCreatedEvent);
    const event = uncommittedEvents[0] as OrganizationCreatedEvent;
    expect(event.organizationId).toBe(organization.getId().value);
    expect(event.name).toBe(name);
    expect(event.address).toBe(address);
    expect(event.taxId).toBe(taxId);
    expect(event.members).toEqual([]);
  });

  it('should update an organization', () => {
    const organization = Organization.create(
      'Old Name',
      'Old Address',
      '0000000000',
    );
    const newName = 'New Name';
    const newAddress = 'New Address';
    const newTaxId = '1111111111';

    organization.update(newName, newAddress, newTaxId);

    expect(organization.getName().value).toBe(newName);
    expect(organization.getAddress().value).toBe(newAddress);
    expect(organization.getTaxId().value).toBe(newTaxId);

    const uncommittedEvents = organization.getUncommittedEvents();
    expect(uncommittedEvents).toHaveLength(2); // Create + Update
    expect(uncommittedEvents[1]).toBeInstanceOf(OrganizationUpdatedEvent);
    const event = uncommittedEvents[1] as OrganizationUpdatedEvent;
    expect(event.name).toBe(newName);
    expect(event.address).toBe(newAddress);
    expect(event.taxId).toBe(newTaxId);
  });

  describe('addMember', () => {
    it('should add a member', () => {
      const organization = Organization.create('Test Org', 'Address', '123');
      const userId = randomUUID();

      organization.addMember(true, userId);
      expect(organization.getVersion().value).toBe(2);

      expect(organization.getMembers()).toHaveLength(1);
      expect(organization.getMembers()[0].isRoot).toBe(true);
      expect(organization.getMembers()[0].organizationUserId.value).toBe(
        userId,
      );

      const uncommittedEvents = organization.getUncommittedEvents();
      expect(uncommittedEvents).toHaveLength(2); // Create + AddMember
      expect(uncommittedEvents[1]).toBeInstanceOf(OrganizationMemberAddedEvent);
      const event = uncommittedEvents[1] as OrganizationMemberAddedEvent;
      expect(event.isRoot).toBe(true);
      expect(event.organizationUserId).toBe(userId);
      expect(event.version).toBe(2);
    });

    it('should throw error if member already exists', () => {
      const organization = Organization.create('Test Org', 'Address', '123');
      const userId = randomUUID();
      organization.addMember(false, userId);

      expect(() => organization.addMember(false, userId)).toThrow(
        AddingOrganizationMemberError,
      );
    });

    it('should throw error if root member already exists', () => {
      const organization = Organization.create('Test Org', 'Address', '123');
      organization.addMember(true, randomUUID());

      expect(() => organization.addMember(true, randomUUID())).toThrow(
        AddingOrganizationMemberError,
      );
    });
  });

  describe('removeMember', () => {
    it('should remove a member', () => {
      const organization = Organization.create('Test Org', 'Address', '123');
      const userId = randomUUID();
      organization.addMember(false, userId);
      const memberId = organization.getMembers()[0].id.value;

      organization.removeMember(memberId);
      expect(organization.getVersion().value).toBe(3);

      expect(organization.getMembers()).toHaveLength(0);

      const uncommittedEvents = organization.getUncommittedEvents();
      expect(uncommittedEvents).toHaveLength(3); // Create + AddMember + RemoveMember
      expect(uncommittedEvents[2]).toBeInstanceOf(
        OrganizationMemberRemovedEvent,
      );
      const event = uncommittedEvents[2] as OrganizationMemberRemovedEvent;
      expect(event.memberId).toBe(memberId);
      expect(event.version).toBe(3);
    });

    it('should throw error if member not found', () => {
      const organization = Organization.create('Test Org', 'Address', '123');
      const nonExistentMemberId = randomUUID();

      expect(() => organization.removeMember(nonExistentMemberId)).toThrow(
        RemovingOrganizationMemberError,
      );
    });
  });
});
