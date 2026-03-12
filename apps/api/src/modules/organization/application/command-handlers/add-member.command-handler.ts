import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { AddMemberCommand } from '../commands/add-member.command';
import { OrganizationRepository } from '../ports/organization.repository';
import { AppError } from '../../../../shared/errors';
import { AggregateVersion } from '../../../../shared/value-objects/aggregate-version';
import { AddingOrganizationMemberError } from '../../domain/errors';

@CommandHandler(AddMemberCommand)
export class AddMemberCommandHandler implements ICommandHandler<
  AddMemberCommand,
  string
> {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: AddMemberCommand): Promise<string> {
    const { organizationId, isRoot, organizationUserId, version } = command;

    const organization =
      await this.organizationRepository.findById(organizationId);

    if (!organization) {
      throw new AppError('ENTITY_NOT_FOUND', 'Organization not found');
    }

    const _version = AggregateVersion.fromNumber(version);

    if (!organization.getVersion().equals(_version)) {
      throw new AppError(
        'CONCURRENCY',
        `Organization with id ${organizationId} has been modified by another process`,
      );
    }

    this.eventPublisher.mergeObjectContext(organization);

    try {
      organization.addMember(isRoot, organizationUserId);
    } catch (error) {
      if (error instanceof AddingOrganizationMemberError) {
        throw new AppError('VALIDATION_ERROR', error.message);
      }
      throw error;
    }

    await this.organizationRepository.save(organization);
    organization.commit();

    return organization.getId().value;
  }
}
