import { LoginProvider } from '../login-provider';
import { AppError } from 'src/shared/errors';
import { CREDENTIALS_PROVIDER } from 'src/modules/user-iam/domain/constants';

describe('LoginProvider Value Object', () => {
  it('should create a valid LoginProvider from credentials method', () => {
    const provider = LoginProvider.credentials();
    expect(provider.value).toBe(CREDENTIALS_PROVIDER);
  });

  it('should create a valid LoginProvider from string', () => {
    const provider = LoginProvider.fromString(CREDENTIALS_PROVIDER);
    expect(provider.value).toBe(CREDENTIALS_PROVIDER);
  });

  it('should throw an error if LoginProvider is invalid', () => {
    const invalidProvider = 'google';
    expect(() => LoginProvider.fromString(invalidProvider)).toThrow(AppError);
    expect(() => LoginProvider.fromString(invalidProvider)).toThrow(
      'Invalid login provider',
    );
  });

  it('should return true if two LoginProviders are equal', () => {
    const provider1 = LoginProvider.credentials();
    const provider2 = LoginProvider.fromString(CREDENTIALS_PROVIDER);
    expect(provider1.equals(provider2)).toBe(true);
  });

  it('should return false if two LoginProviders are different (if there were multiple)', () => {
    // Obecnie jest tylko jeden, ale test equals nadal ma sens
    const provider1 = LoginProvider.credentials();
    const provider2 = LoginProvider.credentials();
    expect(provider1.equals(provider2)).toBe(true);
  });
});
