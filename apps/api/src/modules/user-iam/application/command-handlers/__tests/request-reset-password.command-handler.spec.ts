import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { RequestResetPasswordCommandHandler } from '../request-reset-password.command-handler';
import { UserRepository } from '../../ports/user.repository';
import { TransactionRunner } from 'src/shared/prisma/transaction-runner';
import { OutboxService } from 'src/shared/outbox/outbox.service';
import { RequestResetPasswordCommand } from '../../commands/request-reset-password.command';
import { User } from '../../../domain/user';
import { UserId } from '../../../domain/value-objects/user-id';
import { Email } from 'src/shared/value-objects/email';
import { UserName } from '../../../domain/value-objects/user-name';
import { LoginProvider } from '../../../domain/value-objects/login-provider';
import { IntegrationEvent } from 'src/shared/outbox/outbox.types';

describe('RequestResetPasswordCommandHandler', () => {
  let handler: RequestResetPasswordCommandHandler;
  let userRepository: jest.Mocked<UserRepository>;
  let transactionRunner: jest.Mocked<TransactionRunner>;
  let outboxService: jest.Mocked<OutboxService>;

  beforeEach(async () => {
    userRepository = {
      findByEmail: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;
    transactionRunner = {
      runInTransaction: jest
        .fn()
        .mockImplementation(<T>(cb: (prisma: unknown) => Promise<T>) =>
          cb('prisma-mock'),
        ),
    };
    outboxService = {
      enqueue: jest.fn(),
    } as unknown as jest.Mocked<OutboxService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestResetPasswordCommandHandler,
        {
          provide: UserRepository,
          useValue: userRepository,
        },
        {
          provide: TransactionRunner,
          useValue: transactionRunner,
        },
        {
          provide: OutboxService,
          useValue: outboxService,
        },
      ],
    }).compile();

    handler = module.get<RequestResetPasswordCommandHandler>(
      RequestResetPasswordCommandHandler,
    );
  });

  it('should request reset password successfully', async () => {
    // Given
    const email = 'test@example.com';
    const command = new RequestResetPasswordCommand(email);
    const userId = randomUUID();
    const user = User.reconstruct(
      UserId.fromString(userId),
      Email.fromString(email),
      UserName.fromString('Test User'),
      LoginProvider.credentials(),
      new Date(),
      new Date(),
    );

    userRepository.findByEmail.mockResolvedValue(user);

    // When
    await handler.execute(command);

    // Then
    expect(userRepository.findByEmail).toHaveBeenCalledWith(
      email,
      'prisma-mock',
    );
    expect(outboxService.enqueue).toHaveBeenCalledWith(
      expect.any(IntegrationEvent),
      { deduplicate: true },
      'prisma-mock',
    );
    const event = outboxService.enqueue.mock.calls[0][0];
    expect(event.type).toBe('user-iam.user.requested-reset-password.v1');
    expect(event.payload).toEqual({
      email: user.getEmail().value,
      name: user.getName().value,
      userId: user.getId().value,
    });
  });

  it('should do nothing if user not found', async () => {
    // Given
    const email = 'notfound@example.com';
    const command = new RequestResetPasswordCommand(email);
    userRepository.findByEmail.mockResolvedValue(null);

    // When
    await handler.execute(command);

    // Then
    expect(outboxService.enqueue).not.toHaveBeenCalled();
  });

  it('should do nothing if user has different login provider', async () => {
    // Given
    const email = 'google@example.com';
    const command = new RequestResetPasswordCommand(email);
    const user = User.reconstruct(
      UserId.fromString(randomUUID()),
      Email.fromString(email),
      UserName.fromString('Test User'),
      {
        value: 'google',
        equals: (other: LoginProvider) => other.value === 'google',
      } as unknown as LoginProvider,
      new Date(),
      new Date(),
    );
    userRepository.findByEmail.mockResolvedValue(user);

    // When
    await handler.execute(command);

    // Then
    expect(outboxService.enqueue).not.toHaveBeenCalled();
  });
});
