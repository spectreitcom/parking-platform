import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreateOrganizationCommand } from '../commands/create-organization.command';
import { OrganizationRepository } from '../ports/organization.repository';
import { Organization } from '../../domain/organization';

@CommandHandler(CreateOrganizationCommand)
export class CreateOrganizationCommandHandler implements ICommandHandler<
  CreateOrganizationCommand,
  string
> {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateOrganizationCommand): Promise<string> {
    const { name, taxId, address } = command;

    const organization = Organization.create(name, taxId, address);
    this.eventPublisher.mergeObjectContext(organization);
    await this.organizationRepository.save(organization, { isNew: true });
    organization.commit();
    return organization.getId().value;
  }
}
