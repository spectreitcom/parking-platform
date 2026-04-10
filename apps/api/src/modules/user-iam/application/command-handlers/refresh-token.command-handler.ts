import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RefreshTokenCommand } from '../commands/refresh-token.command';
import { UserRepository } from '../ports/user.repository';
import { AppError } from 'src/shared/errors';
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
    private readonly userRepository: UserRepository,
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

    const { sub: userId, refreshTokenId } = payload;
    const isTokenValid = await this.refreshTokenStorage.validate(
      userId,
      refreshTokenId,
    );

    if (!isTokenValid) {
      throw new AppError('WRONG_CREDENTIALS', 'Invalid refresh token');
    }

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError('WRONG_CREDENTIALS', 'Invalid refresh token');
    }

    const accessToken = this.accessTokenService.createToken(userId);
    const newRefreshTokenId = randomUUID();
    const newRefreshToken = this.refreshTokenService.createToken(
      userId,
      newRefreshTokenId,
    );

    await this.refreshTokenStorage.invalidate(userId);
    await this.refreshTokenStorage.insert(userId, newRefreshTokenId);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}
