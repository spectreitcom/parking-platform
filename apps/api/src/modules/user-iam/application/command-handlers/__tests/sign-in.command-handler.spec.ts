import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { SignInCommandHandler } from '../sign-in.command-handler';
import { UserRepository } from '../../ports/user.repository';
import { AccessTokenService } from '../../ports/access-token.service';
import { RefreshTokenService } from '../../ports/refresh-token.service';
import { RefreshTokenStorage } from '../../ports/refresh-token.storage';
import { SignInCommand } from '../../commands/sign-in.command';
import { User } from '../../../domain/user';
import { UserId } from '../../../domain/value-objects/user-id';
import { Email } from 'src/shared/value-objects/email';
import { UserName } from '../../../domain/value-objects/user-name';
import { LoginProvider } from '../../../domain/value-objects/login-provider';
import { AppError } from 'src/shared/errors';

describe('SignInCommandHandler', () => {
  let handler: SignInCommandHandler;
  let userRepository: jest.Mocked<UserRepository>;
  let accessTokenService: jest.Mocked<AccessTokenService>;
  let refreshTokenService: jest.Mocked<RefreshTokenService>;
  let refreshTokenStorage: jest.Mocked<RefreshTokenStorage>;

  beforeEach(async () => {
    userRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;
    accessTokenService = {
      createToken: jest.fn(),
    } as unknown as jest.Mocked<AccessTokenService>;
    refreshTokenService = {
      createToken: jest.fn(),
    } as unknown as jest.Mocked<RefreshTokenService>;
    refreshTokenStorage = {
      insert: jest.fn(),
    } as unknown as jest.Mocked<RefreshTokenStorage>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignInCommandHandler,
        {
          provide: UserRepository,
          useValue: userRepository,
        },
        {
          provide: AccessTokenService,
          useValue: accessTokenService,
        },
        {
          provide: RefreshTokenService,
          useValue: refreshTokenService,
        },
        {
          provide: RefreshTokenStorage,
          useValue: refreshTokenStorage,
        },
      ],
    }).compile();

    handler = module.get<SignInCommandHandler>(SignInCommandHandler);
  });

  it('should sign in successfully', async () => {
    // Given
    const userId = randomUUID();
    const command = new SignInCommand(userId);
    const accessToken = 'access-token';
    const refreshToken = 'refresh-token';
    const user = User.reconstruct(
      UserId.fromString(userId),
      Email.fromString('test@example.com'),
      UserName.fromString('Test User'),
      LoginProvider.credentials(),
      new Date(),
      new Date(),
    );

    userRepository.findById.mockResolvedValue(user);
    accessTokenService.createToken.mockReturnValue(accessToken);
    refreshTokenService.createToken.mockReturnValue(refreshToken);

    // When
    const result = await handler.execute(command);

    // Then
    expect(userRepository.findById).toHaveBeenCalledWith(userId);
    expect(accessTokenService.createToken).toHaveBeenCalledWith(userId);
    expect(refreshTokenService.createToken).toHaveBeenCalledWith(
      userId,
      expect.any(String),
    );
    expect(refreshTokenStorage.insert).toHaveBeenCalledWith(
      userId,
      expect.any(String),
    );
    expect(result).toEqual({
      accessToken,
      refreshToken,
    });
  });

  it('should throw error if user not found', async () => {
    // Given
    const userId = randomUUID();
    const command = new SignInCommand(userId);
    userRepository.findById.mockResolvedValue(null);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('WRONG_CREDENTIALS', 'Invalid credentials'),
    );
  });
});
