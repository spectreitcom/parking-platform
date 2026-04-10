import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { SignOutCommandHandler } from '../sign-out.command-handler';
import { RefreshTokenStorage } from '../../ports/refresh-token.storage';
import { SignOutCommand } from '../../commands/sign-out.command';

describe('SignOutCommandHandler', () => {
  let handler: SignOutCommandHandler;
  let refreshTokenStorage: jest.Mocked<RefreshTokenStorage>;

  beforeEach(async () => {
    refreshTokenStorage = {
      invalidate: jest.fn(),
    } as unknown as jest.Mocked<RefreshTokenStorage>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignOutCommandHandler,
        {
          provide: RefreshTokenStorage,
          useValue: refreshTokenStorage,
        },
      ],
    }).compile();

    handler = module.get<SignOutCommandHandler>(SignOutCommandHandler);
  });

  it('should sign out successfully', async () => {
    // Given
    const userId = randomUUID();
    const command = new SignOutCommand(userId);

    // When
    await handler.execute(command);

    // Then
    expect(refreshTokenStorage.invalidate).toHaveBeenCalledWith(userId);
  });
});
