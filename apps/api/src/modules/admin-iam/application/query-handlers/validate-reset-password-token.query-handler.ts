import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ValidateResetPasswordTokenQuery } from '../queries/validate-reset-password-token.query';
import { ResetPasswordTokenStorage } from '../ports/reset-password-token.storage';
import { ResetPasswordTokenService } from '../ports/reset-password-token.service';

@QueryHandler(ValidateResetPasswordTokenQuery)
export class ValidateResetPasswordTokenQueryHandler implements IQueryHandler<
  ValidateResetPasswordTokenQuery,
  boolean
> {
  constructor(
    private readonly resetPasswordTokenService: ResetPasswordTokenService,
    private readonly resetPasswordTokenStorage: ResetPasswordTokenStorage,
  ) {}

  async execute(query: ValidateResetPasswordTokenQuery): Promise<boolean> {
    const { resetPasswordToken } = query;

    if (!resetPasswordToken) {
      return false;
    }

    const resetPasswordTokenHash =
      this.resetPasswordTokenService.createHash(resetPasswordToken);

    const userId = await this.resetPasswordTokenStorage.validate(
      resetPasswordTokenHash,
    );

    return !!userId;
  }
}
