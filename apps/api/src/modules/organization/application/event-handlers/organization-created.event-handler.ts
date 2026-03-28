import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OrganizationCreatedEvent } from '../../domain/events/organization-created.event';
import { Logger } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@EventsHandler(OrganizationCreatedEvent)
export class OrganizationCreatedEventHandler implements IEventHandler<OrganizationCreatedEvent> {
  private readonly logger = new Logger(OrganizationCreatedEventHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: OrganizationCreatedEvent) {
    this.logger.log(
      `Handling OrganizationCreatedEvent for organization ${event.organizationId}`,
    );
    const { organizationId, name, taxId, members, address, version } = event;

    await this.prismaService.organizationListForAdminRead.create({
      data: {
        name,
        taxId,
        address,
        organizationId,
        members: members.map((member) => ({
          ...member,
        })),
        version,
      },
    });
  }
}
