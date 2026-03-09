import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AdminUserActivatedEvent } from '../../domain/events/admin-user-activated.event';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { AdminStatus } from '../../domain/value-objects/admin-status';

@EventsHandler(AdminUserActivatedEvent)
export class AdminUserActivatedEventHandler implements IEventHandler<AdminUserActivatedEvent> {
  private readonly logger = new Logger(AdminUserActivatedEventHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: AdminUserActivatedEvent) {
    this.logger.log(`Admin user activated: ${event.id}`);
    const { id, updatedAt } = event;
    await this.prismaService.adminUserRead.update({
      where: { adminUserId: id },
      data: { status: AdminStatus.active().value, updatedAt },
    });
  }
}
