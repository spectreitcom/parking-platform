import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { RegisterUserCommandHandler } from '../register-user.command-handler';
import { UserRepository } from '../../ports/user.repository';
import { PasswordService } from '../../ports/password.service';
import { RegisterUserCommand } from '../../commands/register-user.command';
import { AppError } from 'src/shared/errors';
import { User } from '../../../domain/user';
import { Email } from 'src/shared/value-objects/email';
import { UserName } from '../../../domain/value-objects/user-name';
import { UserId } from '../../../domain/value-objects/user-id';
import { LoginProvider } from '../../../domain/value-objects/login-provider';

describe('RegisterUserCommandHandler', () => {
  let handler: RegisterUserCommandHandler;
  let userRepository: jest.Mocked<UserRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;
  let passwordService: jest.Mocked<PasswordService>;

  beforeEach(async () => {
    userRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    eventPublisher = {
      mergeObjectContext: jest.fn(<T>(obj: T): T => obj),
    } as unknown as jest.Mocked<EventPublisher>;

    passwordService = {
      create: jest.fn(),
    } as unknown as jest.Mocked<PasswordService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserCommandHandler,
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

    handler = module.get<RegisterUserCommandHandler>(
      RegisterUserCommandHandler,
    );
  });

  it('should register user successfully', async () => {
    // Given
    const email = 'test@example.com';
    const password = 'password123';
    const name = 'Test User';
    const passwordHash = 'hashed-password';
    const command = new RegisterUserCommand(email, password, name);

    userRepository.findByEmail.mockResolvedValue(null);
    passwordService.create.mockResolvedValue(passwordHash);

    // When
    const result = await handler.execute(command);

    // Then
    expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
    expect(passwordService.create).toHaveBeenCalledWith(password);
    expect(eventPublisher.mergeObjectContext).toHaveBeenCalledWith(
      expect.any(User),
    );
    expect(userRepository.save).toHaveBeenCalledWith(expect.any(User), {
      isNew: true,
    });

    const savedUser = userRepository.save.mock.calls[0][0];
    expect(savedUser.getEmail().value).toBe(email);
    expect(savedUser.getName().value).toBe(name);
    expect(savedUser.getPasswordHash()).toBe(passwordHash);
    expect(savedUser.getProvider().value).toBe(
      LoginProvider.credentials().value,
    );

    expect(result).toBe(savedUser.getId().value);
  });

  it('should throw error if user with provided email already exists', async () => {
    // Given
    const email = 'test@example.com';
    const command = new RegisterUserCommand(email, 'password123', 'Test User');
    const existingUser = User.reconstruct(
      UserId.create(),
      Email.fromString(email),
      UserName.fromString('Existing User'),
      LoginProvider.credentials(),
      new Date(),
      new Date(),
      'some-hash',
    );

    userRepository.findByEmail.mockResolvedValue(existingUser);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('ALREADY_EXISTS', 'User with provided email already exists'),
    );
    expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
    expect(passwordService.create).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('should throw error if email is invalid', async () => {
    // Given
    const command = new RegisterUserCommand(
      'invalid-email',
      'password123',
      'Test User',
    );
    userRepository.findByEmail.mockResolvedValue(null);
    passwordService.create.mockResolvedValue('hash');

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('VALIDATION_ERROR', 'Invalid email'),
    );
    expect(userRepository.save).not.toHaveBeenCalled();
  });
});
