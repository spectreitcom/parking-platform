import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserUpdatedEvent } from 'src/modules/user-iam/domain/events/user-updated.event';
import { Logger } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@EventsHandler(UserUpdatedEvent)
export class UserUpdatedEventHandler implements IEventHandler<UserUpdatedEvent> {
  private readonly logger = new Logger(UserUpdatedEventHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: UserUpdatedEvent) {
    this.logger.log('User updated', event.userId);
    const { userId, updatedAt, name, provider, email } = event;

    await this.prismaService.userRead.update({
      where: { id: userId },
      data: { updatedAt, name, provider, email },
    });
  }
}
