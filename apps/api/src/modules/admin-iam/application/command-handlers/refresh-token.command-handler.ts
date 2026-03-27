import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RefreshTokenCommand } from '../commands/refresh-token.command';
import { AdminUserRepository } from '../ports/admin-user.repository';
import { AppError } from 'src/shared/errors';
import { AdminStatus } from '../../domain/value-objects/admin-status';
import { AccessTokenService } from '../ports/access-token.service';
import { randomUUID } from 'node:crypto';
import { RefreshTokenService } from '../ports/refresh-token.service';
import { RefreshTokenStorage } from '../ports/refresh-token.storage';
import { SignInCommandResponse } from './sign-in.command-handler';

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenCommandHandler implements ICommandHandler<
  RefreshTokenCommand,
  SignInCommandResponse
> {
  constructor(
    private readonly adminUserRepository: AdminUserRepository,
    private readonly accessTokenService: AccessTokenService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly refreshTokenStorage: RefreshTokenStorage,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<SignInCommandResponse> {
    const { refreshToken } = command;

    const payload = this.refreshTokenService.verifyToken(refreshToken);

    if (!payload) {
      throw new AppError('WRONG_CREDENTIALS', 'Invalid refresh token');
    }

    const { sub: adminUserId, refreshTokenId } = payload;

    const isTokenValid = await this.refreshTokenStorage.validate(
      adminUserId,
      refreshTokenId,
    );

    if (!isTokenValid) {
      throw new AppError('WRONG_CREDENTIALS', 'Invalid refresh token');
    }

    const adminUser = await this.adminUserRepository.findById(adminUserId);

    const canSignIn =
      adminUser && adminUser.getStatus().equals(AdminStatus.active());

    if (!canSignIn) {
      throw new AppError('WRONG_CREDENTIALS', 'Invalid refresh token');
    }

    const accessToken = this.accessTokenService.createToken(adminUserId);

    const newRefreshTokenId = randomUUID();

    const newRefreshToken = this.refreshTokenService.createToken(
      adminUserId,
      newRefreshTokenId,
    );

    await this.refreshTokenStorage.invalidate(adminUserId);
    await this.refreshTokenStorage.insert(adminUserId, newRefreshTokenId);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}
