import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AdminUserPasswordChangedEvent } from '../../domain/events/admin-user-password-changed.event';
import { PrismaService } from '../../../../shared/prisma/prisma.service';

@EventsHandler(AdminUserPasswordChangedEvent)
export class AdminUserPasswordChangedEventHandler implements IEventHandler<AdminUserPasswordChangedEvent> {
  private readonly logger = new Logger(
    AdminUserPasswordChangedEventHandler.name,
  );

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: AdminUserPasswordChangedEvent) {
    this.logger.log(`Admin user password changed: ${event.id}`);
    const { id, updatedAt } = event;

    await this.prismaService.adminUserRead.update({
      where: { adminUserId: id },
      data: { updatedAt },
    });
  }
}
