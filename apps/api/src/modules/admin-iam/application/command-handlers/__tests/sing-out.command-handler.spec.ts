import { SignOutCommandHandler } from '../sign-out.command-handler';
import { RefreshTokenStorage } from '../../ports/refresh-token.storage';
import { SignOutCommand } from '../../commands/sign-out.command';

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
    const adminUserId = '4979e954-5e18-4794-b295-d85c8e3b2e50';
    const command = new SignOutCommand(adminUserId);
    refreshTokenStorage.invalidate.mockResolvedValue();

    // When
    await handler.execute(command);

    // Then
    expect(refreshTokenStorage.invalidate).toHaveBeenCalledWith(adminUserId);
  });
});
