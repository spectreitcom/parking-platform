import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RefreshTokenCommand } from '../commands/refresh-token.command';
import { OrganizationUserRepository } from '../ports/organization-user.repository';
import { AppError } from 'src/shared/errors';
import { OrganizationUserStatus } from '../../domain/value-objects/organization-user-status';
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
    private readonly organizationUserRepository: OrganizationUserRepository,
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

    const { sub: organizationUserId, refreshTokenId } = payload;

    const isTokenValid = await this.refreshTokenStorage.validate(
      organizationUserId,
      refreshTokenId,
    );

    if (!isTokenValid) {
      throw new AppError('WRONG_CREDENTIALS', 'Invalid refresh token');
    }

    const organizationUser =
      await this.organizationUserRepository.findById(organizationUserId);

    const canSignIn =
      organizationUser &&
      organizationUser.getStatus().equals(OrganizationUserStatus.active());

    if (!canSignIn) {
      throw new AppError('WRONG_CREDENTIALS', 'Invalid refresh token');
    }

    const accessToken = this.accessTokenService.createToken(organizationUserId);

    const newRefreshTokenId = randomUUID();

    const newRefreshToken = this.refreshTokenService.createToken(
      organizationUserId,
      newRefreshTokenId,
    );

    await this.refreshTokenStorage.invalidate(organizationUserId);
    await this.refreshTokenStorage.insert(
      organizationUserId,
      newRefreshTokenId,
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}
