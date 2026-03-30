import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SignInCommand } from '../commands/sign-in.command';
import { OrganizationUserRepository } from '../ports/organization-user.repository';
import { PasswordService } from '../ports/password.service';
import { AccessTokenService } from '../ports/access-token.service';
import { RefreshTokenService } from '../ports/refresh-token.service';
import { RefreshTokenStorage } from '../ports/refresh-token.storage';
import { AppError } from 'src/shared/errors';
import { OrganizationUserStatus } from '../../domain/value-objects/organization-user-status';
import { randomUUID } from 'node:crypto';

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
    private readonly organizationUserRepository: OrganizationUserRepository,
    private readonly passwordService: PasswordService,
    private readonly accessTokenService: AccessTokenService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly refreshTokenStorage: RefreshTokenStorage,
  ) {}

  async execute(command: SignInCommand): Promise<SignInCommandResponse> {
    const { email, password } = command;

    const organizationUser =
      await this.organizationUserRepository.findByEmail(email);

    const canSignIn =
      organizationUser &&
      organizationUser.getStatus().equals(OrganizationUserStatus.active());

    if (!canSignIn) {
      throw new AppError('WRONG_CREDENTIALS', 'Invalid credentials');
    }

    const isPasswordValid = await this.passwordService.compare(
      organizationUser.getPasswordHash() || '',
      password,
    );

    if (!isPasswordValid) {
      throw new AppError('WRONG_CREDENTIALS', 'Invalid credentials');
    }

    const organizationUserId = organizationUser.getId().value;

    const accessToken = this.accessTokenService.createToken(organizationUserId);

    const refreshTokenId = randomUUID();

    const refreshToken = this.refreshTokenService.createToken(
      organizationUserId,
      refreshTokenId,
    );

    await this.refreshTokenStorage.insert(organizationUserId, refreshTokenId);

    return {
      accessToken,
      refreshToken,
    };
  }
}
