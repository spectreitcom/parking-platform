import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AdminUserSuspendedEvent } from '../../domain/events/admin-user-suspended.event';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { AdminStatus } from '../../domain/value-objects/admin-status';

@EventsHandler(AdminUserSuspendedEvent)
export class AdminUserSuspendedEventHandler implements IEventHandler<AdminUserSuspendedEvent> {
  private readonly logger = new Logger(AdminUserSuspendedEventHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: AdminUserSuspendedEvent) {
    this.logger.log(`Admin user suspended: ${event.id}`);
    const { id, updatedAt } = event;

    await this.prismaService.adminUserRead.update({
      where: { adminUserId: id },
      data: { updatedAt, status: AdminStatus.suspended().value },
    });
  }
}
