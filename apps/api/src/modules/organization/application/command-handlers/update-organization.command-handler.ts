import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { UpdateOrganizationCommand } from '../commands/update-organization.command';
import { OrganizationRepository } from '../ports/organization.repository';
import { AppError } from '../../../../shared/errors';
import { AggregateVersion } from '../../../../shared/value-objects/aggregate-version';

@CommandHandler(UpdateOrganizationCommand)
export class UpdateOrganizationCommandHandler implements ICommandHandler<
  UpdateOrganizationCommand,
  string
> {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: UpdateOrganizationCommand): Promise<string> {
    const { id, name, address, taxId, version } = command;

    const organization = await this.organizationRepository.findById(id);

    if (!organization) {
      throw new AppError('ENTITY_NOT_FOUND', 'Organization not found');
    }

    const _version = AggregateVersion.fromNumber(version);

    if (!organization.getVersion().equals(_version)) {
      throw new AppError(
        'CONCURRENCY',
        `Organization with id ${id} has been modified by another process`,
      );
    }

    this.eventPublisher.mergeObjectContext(organization);
    organization.update(name, address, taxId);

    await this.organizationRepository.save(organization);
    organization.commit();

    return organization.getId().value;
  }
}
