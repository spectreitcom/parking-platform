import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { randomUUID } from 'node:crypto';
import { ChangePasswordCommandHandler } from '../change-password.command-handler';
import { UserRepository } from '../../ports/user.repository';
import { PasswordService } from '../../ports/password.service';
import { ChangePasswordCommand } from '../../commands/change-password.command';
import { User } from '../../../domain/user';
import { UserId } from '../../../domain/value-objects/user-id';
import { Email } from 'src/shared/value-objects/email';
import { UserName } from '../../../domain/value-objects/user-name';
import { LoginProvider } from '../../../domain/value-objects/login-provider';
import { AppError } from 'src/shared/errors';

describe('ChangePasswordCommandHandler', () => {
  let handler: ChangePasswordCommandHandler;
  let userRepository: jest.Mocked<UserRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;
  let passwordService: jest.Mocked<PasswordService>;

  beforeEach(async () => {
    userRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;
    eventPublisher = {
      mergeObjectContext: jest.fn().mockImplementation(<T>(obj: T): T => obj),
    } as unknown as jest.Mocked<EventPublisher>;
    passwordService = {
      compare: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<PasswordService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangePasswordCommandHandler,
        {
          provide: UserRepository,
          useValue: userRepository,
        },
        {
          provide: EventPublisher,
          useValue: eventPublisher,
        },
        {
          provide: PasswordService,
          useValue: passwordService,
        },
      ],
    }).compile();

    handler = module.get<ChangePasswordCommandHandler>(
      ChangePasswordCommandHandler,
    );
  });

  it('should change password successfully', async () => {
    // Given
    const userId = randomUUID();
    const existingPassword = 'old-password';
    const newPassword = 'new-password';
    const command = new ChangePasswordCommand(
      userId,
      existingPassword,
      newPassword,
    );
    const user = User.reconstruct(
      UserId.fromString(userId),
      Email.fromString('test@example.com'),
      UserName.fromString('Test User'),
      LoginProvider.credentials(),
      new Date(),
      new Date(),
      'hashed-old-password',
    );
    const newHash = 'hashed-new-password';

    userRepository.findById.mockResolvedValue(user);
    passwordService.compare.mockResolvedValue(true);
    passwordService.create.mockResolvedValue(newHash);

    // When
    await handler.execute(command);

    // Then
    expect(userRepository.findById).toHaveBeenCalledWith(userId);
    expect(passwordService.compare).toHaveBeenCalledWith(
      'hashed-old-password',
      existingPassword,
    );
    expect(passwordService.create).toHaveBeenCalledWith(newPassword);
    expect(userRepository.save).toHaveBeenCalledWith(user);
    expect(user.getPasswordHash()).toBe(newHash);
  });

  it('should throw error if user not found', async () => {
    // Given
    const userId = randomUUID();
    const command = new ChangePasswordCommand(userId, 'old', 'new');
    userRepository.findById.mockResolvedValue(null);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('ENTITY_NOT_FOUND', 'User not found'),
    );
  });

  it('should throw error if user has different login provider', async () => {
    // Given
    const userId = randomUUID();
    const command = new ChangePasswordCommand(userId, 'old', 'new');
    const user = User.reconstruct(
      UserId.fromString(userId),
      Email.fromString('test@example.com'),
      UserName.fromString('Test User'),
      {
        value: 'google',
        equals: (other: LoginProvider) => other.value === 'google',
      } as unknown as LoginProvider,
      new Date(),
      new Date(),
    );
    userRepository.findById.mockResolvedValue(user);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError(
        'FORBIDDEN_OPERATION',
        'Cannot change password for this user',
      ),
    );
  });

  it('should throw error if existing password is invalid', async () => {
    // Given
    const userId = randomUUID();
    const command = new ChangePasswordCommand(userId, 'wrong-old', 'new');
    const user = User.reconstruct(
      UserId.fromString(userId),
      Email.fromString('test@example.com'),
      UserName.fromString('Test User'),
      LoginProvider.credentials(),
      new Date(),
      new Date(),
      'hashed-old-password',
    );
    userRepository.findById.mockResolvedValue(user);
    passwordService.compare.mockResolvedValue(false);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('VALIDATION_ERROR', 'Invalid existing password'),
    );
  });
});
