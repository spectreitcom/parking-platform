import { CreateOrganizationCommandHandler } from './create-organization.command-handler';
import { UpdateOrganizationCommandHandler } from './update-organization.command-handler';
import { AddMemberCommandHandler } from './add-member.command-handler';
import { RemoveMemberCommandHandler } from './remove-member.command-handler';

export const commandHandlers = [
  CreateOrganizationCommandHandler,
  UpdateOrganizationCommandHandler,
  AddMemberCommandHandler,
  RemoveMemberCommandHandler,
];
