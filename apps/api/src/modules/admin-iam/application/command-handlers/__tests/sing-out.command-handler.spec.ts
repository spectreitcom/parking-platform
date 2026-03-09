import { SignOutCommandHandler } from '../sign-out.command-handler';
import { RefreshTokenStorage } from '../../ports/refresh-token.storage';
import { SignOutCommand } from '../../commands/sign-out.command';
import { randomUUID } from 'node:crypto';

describe('SingOutCommandHandler', () => {
  let handler: SignOutCommandHandler;
  let refreshTokenStorage: jest.Mocked<RefreshTokenStorage>;

  beforeEach(() => {
    refreshTokenStorage = {
      insert: jest.fn(),
      invalidate: jest.fn(),
    } as any;

    handler = new SignOutCommandHandler(refreshTokenStorage);
  });

  it('should invalidate refresh token successfully', async () => {
    // Given
    const adminUserId = randomUUID();
    const command = new SignOutCommand(adminUserId);
    refreshTokenStorage.invalidate.mockResolvedValue();

    // When
    await handler.execute(command);

    // Then
    expect(refreshTokenStorage.invalidate).toHaveBeenCalledWith(adminUserId);
  });
});
