import { Email } from '../email';

describe('Email', () => {
  it('should create a valid email object', () => {
    const emailValue = 'test@example.com';
    const email = Email.fromString(emailValue);
    expect(email.value).toBe(emailValue);
  });

  it('should throw an error if email is invalid', () => {
    const invalidEmail = 'invalid-email';
    expect(() => Email.fromString(invalidEmail)).toThrow('Invalid email');
  });

  it('should throw an error if email is empty', () => {
    const emptyEmail = '';
    expect(() => Email.fromString(emptyEmail)).toThrow('Invalid email');
  });

  it('should throw an error if email exceeds 255 characters', () => {
    // Standard email limit is usually 254 characters.
    const longEmail =
      'a'.repeat(64) +
      '@' +
      ('b'.repeat(63) + '.') +
      ('c'.repeat(63) + '.') +
      ('d'.repeat(61) + '.com'); // 64 + 1 + 64 + 64 + 65 = 258
    expect(() => Email.fromString(longEmail)).toThrow('Invalid email');
  });

  it('should create a valid email if length is exactly 254 characters', () => {
    const validLongEmail =
      'a'.repeat(64) +
      '@' +
      ('b'.repeat(63) + '.') +
      ('c'.repeat(63) + '.') +
      ('d'.repeat(57) + '.com'); // 64 + 1 + 64 + 64 + 61 = 254
    const email = Email.fromString(validLongEmail);
    expect(email.value).toBe(validLongEmail);
  });

  describe('equals', () => {
    it('should return true if both emails are equal', () => {
      const email1 = Email.fromString('test@example.com');
      const email2 = Email.fromString('test@example.com');
      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false if emails are different', () => {
      const email1 = Email.fromString('test1@example.com');
      const email2 = Email.fromString('test2@example.com');
      expect(email1.equals(email2)).toBe(false);
    });
  });
});
