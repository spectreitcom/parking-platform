import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SignOutCommand } from '../commands/sign-out.command';
import { RefreshTokenStorage } from '../ports/refresh-token.storage';

@CommandHandler(SignOutCommand)
export class SignOutCommandHandler implements ICommandHandler<
  SignOutCommand,
  void
> {
  constructor(private readonly refreshTokenStorage: RefreshTokenStorage) {}

  async execute(command: SignOutCommand): Promise<void> {
    const { userId } = command;
    await this.refreshTokenStorage.invalidate(userId);
  }
}
