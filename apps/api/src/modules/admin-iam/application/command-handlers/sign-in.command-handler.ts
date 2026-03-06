import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SignInCommand } from '../commands/sign-in.command';
import { AdminUserRepository } from '../ports/admin-user.repository';
import { AppError } from '../../../../shared/errors';
import { AdminStatus } from '../../domain/value-objects/admin-status';
import { AccessTokenService } from '../ports/access-token.service';
import { randomUUID } from 'node:crypto';
import { RefreshTokenService } from '../ports/refresh-token.service';
import { RefreshTokenStorage } from '../ports/refresh-token.storage';

export type SignInCommandResponse = {
  accessToken: string;
  refreshToken: string;
};

@CommandHandler(SignInCommand)
export class SignInCommandHandler implements ICommandHandler<
  SignInCommand,
  SignInCommandResponse
> {
  constructor(
    private readonly adminUserRepository: AdminUserRepository,
    private readonly accessTokenService: AccessTokenService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly refreshTokenStorage: RefreshTokenStorage,
  ) {}

  async execute(command: SignInCommand): Promise<SignInCommandResponse> {
    const { adminUserId } = command;

    const adminUser = await this.adminUserRepository.findById(adminUserId);

    const canSignIn =
      adminUser && adminUser.getStatus().equals(AdminStatus.active());

    if (!canSignIn) {
      throw new AppError('WRONG_CREDENTIALS', 'Invalid credentials');
    }

    const accessToken = this.accessTokenService.createToken(adminUserId);

    const refreshTokenId = randomUUID();

    const refreshToken = this.refreshTokenService.createToken(
      adminUserId,
      refreshTokenId,
    );

    await this.refreshTokenStorage.insert(adminUserId, refreshTokenId);

    return {
      accessToken,
      refreshToken,
    };
  }
}
