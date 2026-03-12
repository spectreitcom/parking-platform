import { OrganizationCreatedEventHandler } from './organization-created.event-handler';
import { OrganizationMemberAddedEventHandler } from './organization-member-added.event-handler';
import { OrganizationMemberRemovedEventHandler } from './organization-member-removed.event-handler';
import { OrganizationUpdatedEventHandler } from './organization-updated.event-handler';

export const eventHandlers = [
  OrganizationCreatedEventHandler,
  OrganizationMemberAddedEventHandler,
  OrganizationMemberRemovedEventHandler,
  OrganizationUpdatedEventHandler,
];
