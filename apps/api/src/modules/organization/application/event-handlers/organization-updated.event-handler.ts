import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OrganizationUpdatedEvent } from '../../domain/events/organization-updated.event';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma/prisma.service';

@EventsHandler(OrganizationUpdatedEvent)
export class OrganizationUpdatedEventHandler implements IEventHandler<OrganizationUpdatedEvent> {
  private readonly logger = new Logger(OrganizationUpdatedEventHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: OrganizationUpdatedEvent) {
    this.logger.log(
      `Handling OrganizationUpdatedEvent for organization ${event.organizationId}`,
    );

    const { organizationId, name, taxId, members, address } = event;

    await this.prismaService.organizationListForAdminRead.upsert({
      where: { organizationId },
      update: {
        name,
        taxId,
        address,
        members: members.map((member) => ({
          ...member,
        })),
      },
      create: {
        organizationId,
        name,
        taxId,
        address,
        members: members.map((member) => ({
          ...member,
        })),
      },
    });
  }
}
