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
    private readonly resetPasswordService: ResetPasswordTokenService,
    private readonly resetPasswordTokenStorage: ResetPasswordTokenStorage,
  ) {}

  async execute(command: GenerateResetPasswordTokenCommand): Promise<string> {
    const { adminUserId } = command;

    const resetPasswordToken = randomUUID();

    const resetPasswordTokenHash =
      this.resetPasswordService.createHash(resetPasswordToken);

    await this.resetPasswordTokenStorage.insert(
      adminUserId,
      resetPasswordTokenHash,
    );

    return resetPasswordToken;
  }
}
