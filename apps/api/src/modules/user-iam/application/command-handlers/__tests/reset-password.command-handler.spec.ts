import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { EventPublisher } from '@nestjs/cqrs';
import { ResetPasswordCommandHandler } from '../reset-password.command-handler';
import { UserRepository } from '../../ports/user.repository';
import { ResetPasswordTokenService } from '../../ports/reset-password-token.service';
import { ResetPasswordTokenStorage } from '../../ports/reset-password-token.storage';
import { PasswordService } from '../../ports/password.service';
import { ResetPasswordCommand } from '../../commands/reset-password.command';
import { AppError } from 'src/shared/errors';
import { User } from '../../../domain/user';
import { UserId } from '../../../domain/value-objects/user-id';
import { Email } from 'src/shared/value-objects/email';
import { UserName } from '../../../domain/value-objects/user-name';
import { LoginProvider } from '../../../domain/value-objects/login-provider';

describe('ResetPasswordCommandHandler', () => {
  let handler: ResetPasswordCommandHandler;
  let userRepository: jest.Mocked<UserRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;
  let resetPasswordTokenService: jest.Mocked<ResetPasswordTokenService>;
  let resetPasswordTokenStorage: jest.Mocked<ResetPasswordTokenStorage>;
  let passwordService: jest.Mocked<PasswordService>;

  beforeEach(async () => {
    userRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;
    eventPublisher = {
      mergeObjectContext: jest.fn().mockImplementation(<T>(obj: T): T => obj),
    } as unknown as jest.Mocked<EventPublisher>;
    resetPasswordTokenService = {
      createHash: jest.fn(),
    } as unknown as jest.Mocked<ResetPasswordTokenService>;
    resetPasswordTokenStorage = {
      validate: jest.fn(),
      invalidate: jest.fn(),
    } as unknown as jest.Mocked<ResetPasswordTokenStorage>;
    passwordService = {
      create: jest.fn(),
    } as unknown as jest.Mocked<PasswordService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResetPasswordCommandHandler,
        {
          provide: UserRepository,
          useValue: userRepository,
        },
        {
          provide: EventPublisher,
          useValue: eventPublisher,
        },
        {
          provide: ResetPasswordTokenService,
          useValue: resetPasswordTokenService,
        },
        {
          provide: ResetPasswordTokenStorage,
          useValue: resetPasswordTokenStorage,
        },
        {
          provide: PasswordService,
          useValue: passwordService,
        },
      ],
    }).compile();

    handler = module.get<ResetPasswordCommandHandler>(
      ResetPasswordCommandHandler,
    );
  });

  it('should reset password successfully', async () => {
    // Given
    const token = 'reset-token';
    const tokenHash = 'hashed-token';
    const password = 'new-password';
    const passwordHash = 'hashed-password';
    const userId = randomUUID();
    const command = new ResetPasswordCommand(token, password);
    const user = User.reconstruct(
      UserId.fromString(userId),
      Email.fromString('test@example.com'),
      UserName.fromString('Test User'),
      LoginProvider.credentials(),
      new Date(),
      new Date(),
    );

    resetPasswordTokenService.createHash.mockReturnValue(tokenHash);
    resetPasswordTokenStorage.validate.mockResolvedValue(userId);
    userRepository.findById.mockResolvedValue(user);
    passwordService.create.mockResolvedValue(passwordHash);

    // When
    await handler.execute(command);

    // Then
    expect(resetPasswordTokenService.createHash).toHaveBeenCalledWith(token);
    expect(resetPasswordTokenStorage.validate).toHaveBeenCalledWith(tokenHash);
    expect(userRepository.findById).toHaveBeenCalledWith(userId);
    expect(resetPasswordTokenStorage.invalidate).toHaveBeenCalledWith(
      tokenHash,
    );
    expect(passwordService.create).toHaveBeenCalledWith(password);
    expect(userRepository.save).toHaveBeenCalledWith(user);
    expect(user.getPasswordHash()).toBe(passwordHash);
  });

  it('should throw error if token is invalid', async () => {
    // Given
    const token = 'invalid-token';
    const tokenHash = 'hashed-invalid-token';
    const command = new ResetPasswordCommand(token, 'pass');

    resetPasswordTokenService.createHash.mockReturnValue(tokenHash);
    resetPasswordTokenStorage.validate.mockResolvedValue(false);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('VALIDATION_ERROR', 'Invalid reset password token'),
    );
  });

  it('should throw error if user not found', async () => {
    // Given
    const token = 'token';
    const tokenHash = 'hashed-token';
    const userId = randomUUID();
    const command = new ResetPasswordCommand(token, 'pass');

    resetPasswordTokenService.createHash.mockReturnValue(tokenHash);
    resetPasswordTokenStorage.validate.mockResolvedValue(userId);
    userRepository.findById.mockResolvedValue(null);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('ENTITY_NOT_FOUND', 'User not found'),
    );
  });
});
