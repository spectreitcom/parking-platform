import { SingOutCommandHandler } from '../sing-out.command-handler';
import { RefreshTokenStorage } from '../../ports/refresh-token.storage';
import { SingOutCommand } from '../../commands/sing-out.command';

describe('SingOutCommandHandler', () => {
  let handler: SingOutCommandHandler;
  let refreshTokenStorage: jest.Mocked<RefreshTokenStorage>;

  beforeEach(() => {
    refreshTokenStorage = {
      insert: jest.fn(),
      invalidate: jest.fn(),
    } as any;

    handler = new SingOutCommandHandler(refreshTokenStorage);
  });

  it('should invalidate refresh token successfully', async () => {
    // Given
    const adminUserId = '4979e954-5e18-4794-b295-d85c8e3b2e50';
    const command = new SingOutCommand(adminUserId);
    refreshTokenStorage.invalidate.mockResolvedValue();

    // When
    await handler.execute(command);

    // Then
    expect(refreshTokenStorage.invalidate).toHaveBeenCalledWith(adminUserId);
  });
});
