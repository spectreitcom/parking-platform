import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { RemoveMemberCommand } from '../commands/remove-member.command';
import { OrganizationRepository } from '../ports/organization.repository';
import { AppError } from '../../../../shared/errors';
import { AggregateVersion } from '../../../../shared/value-objects/aggregate-version';
import { RemovingOrganizationMemberError } from '../../domain/errors';

@CommandHandler(RemoveMemberCommand)
export class RemoveMemberCommandHandler implements ICommandHandler<
  RemoveMemberCommand,
  string
> {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: RemoveMemberCommand): Promise<string> {
    const { organizationId, memberId, version } = command;

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
      organization.removeMember(memberId);
    } catch (error) {
      if (error instanceof RemovingOrganizationMemberError) {
        throw new AppError('VALIDATION_ERROR', error.message);
      }
      throw error;
    }

    await this.organizationRepository.save(organization);
    organization.commit();

    return organization.getId().value;
  }
}
