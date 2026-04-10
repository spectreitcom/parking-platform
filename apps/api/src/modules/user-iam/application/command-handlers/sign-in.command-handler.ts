import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SignInCommand } from '../commands/sign-in.command';
import { UserRepository } from '../ports/user.repository';
import { AppError } from 'src/shared/errors';
import { AccessTokenService } from '../ports/access-token.service';
import { randomUUID } from 'node:crypto';
import { RefreshTokenService } from '../ports/refresh-token.service';
import { RefreshTokenStorage } from '../ports/refresh-token.storage';
import { LoginProvider } from 'src/modules/user-iam/domain/value-objects/login-provider';

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
    private readonly userRepository: UserRepository,
    private readonly accessTokenService: AccessTokenService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly refreshTokenStorage: RefreshTokenStorage,
  ) {}

  async execute(command: SignInCommand): Promise<SignInCommandResponse> {
    const { userId } = command;

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError('WRONG_CREDENTIALS', 'Invalid credentials');
    }

    if (!user.getProvider().equals(LoginProvider.credentials())) {
      throw new AppError('WRONG_CREDENTIALS', 'Invalid credentials');
    }

    const accessToken = this.accessTokenService.createToken(userId);
    const refreshTokenId = randomUUID();
    const refreshToken = this.refreshTokenService.createToken(
      userId,
      refreshTokenId,
    );

    await this.refreshTokenStorage.insert(userId, refreshTokenId);

    return {
      accessToken,
      refreshToken,
    };
  }
}
