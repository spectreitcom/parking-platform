import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SingOutCommand } from '../commands/sing-out.command';
import { RefreshTokenStorage } from '../ports/refresh-token.storage';

@CommandHandler(SingOutCommand)
export class SingOutCommandHandler implements ICommandHandler<
  SingOutCommand,
  void
> {
  constructor(private readonly refreshTokenStorage: RefreshTokenStorage) {}

  async execute(command: SingOutCommand): Promise<void> {
    const { adminUserId } = command;
    await this.refreshTokenStorage.invalidate(adminUserId);
  }
}
