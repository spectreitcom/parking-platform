import { UserName } from '../user-name';
import { AppError } from 'src/shared/errors';

describe('UserName Value Object', () => {
  it('should create a valid UserName', () => {
    const name = 'Jan Kowalski';
    const userName = UserName.fromString(name);
    expect(userName.value).toBe(name);
  });

  it('should throw an error if UserName is too long', () => {
    const longName = 'a'.repeat(121);
    expect(() => UserName.fromString(longName)).toThrow(AppError);
    expect(() => UserName.fromString(longName)).toThrow('Invalid UserName');
  });

  it('should return true if two UserNames are equal', () => {
    const name = 'Jan Kowalski';
    const userName1 = UserName.fromString(name);
    const userName2 = UserName.fromString(name);
    expect(userName1.equals(userName2)).toBe(true);
  });

  it('should return false if two UserNames are different', () => {
    const userName1 = UserName.fromString('Jan Kowalski');
    const userName2 = UserName.fromString('Piotr Nowak');
    expect(userName1.equals(userName2)).toBe(false);
  });
});
