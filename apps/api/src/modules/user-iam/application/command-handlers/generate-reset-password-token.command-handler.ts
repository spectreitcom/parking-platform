import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GenerateResetPasswordTokenCommand } from '../commands/generate-reset-password-token.command';
import { ResetPasswordTokenService } from '../ports/reset-password-token.service';
import { ResetPasswordTokenStorage } from '../ports/reset-password-token.storage';
import { randomUUID } from 'node:crypto';

@CommandHandler(GenerateResetPasswordTokenCommand)
export class GenerateResetPasswordTokenCommandHandler implements ICommandHandler<
  GenerateResetPasswordTokenCommand,
  string
> {
  constructor(
    private readonly resetPasswordTokenService: ResetPasswordTokenService,
    private readonly resetPasswordTokenStorage: ResetPasswordTokenStorage,
  ) {}

  async execute(command: GenerateResetPasswordTokenCommand): Promise<string> {
    const { userId } = command;

    const resetPasswordToken = randomUUID();
    const resetPasswordTokenHash =
      this.resetPasswordTokenService.createHash(resetPasswordToken);

    await this.resetPasswordTokenStorage.insert(userId, resetPasswordTokenHash);

    return resetPasswordToken;
  }
}
