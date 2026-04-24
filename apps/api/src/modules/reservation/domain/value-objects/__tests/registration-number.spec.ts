import { RegistrationNumber } from '../registration-number';
import { AppError } from 'src/shared/errors';

describe('RegistrationNumber', () => {
  const validRegistrationNumber = 'ABC-12345';

  it('should create a valid RegistrationNumber object', () => {
    const registrationNumber = RegistrationNumber.fromString(
      validRegistrationNumber,
    );
    expect(registrationNumber.value).toBe(validRegistrationNumber);
  });

  it('should throw an error if RegistrationNumber is too long', () => {
    const tooLongRegistrationNumber = 'A'.repeat(21);
    expect(() =>
      RegistrationNumber.fromString(tooLongRegistrationNumber),
    ).toThrow(new AppError('VALIDATION_ERROR', 'Invalid RegistrationNumber'));
  });

  it('should return true when comparing two identical RegistrationNumbers', () => {
    const registrationNumber1 = RegistrationNumber.fromString(
      validRegistrationNumber,
    );
    const registrationNumber2 = RegistrationNumber.fromString(
      validRegistrationNumber,
    );
    expect(registrationNumber1.equals(registrationNumber2)).toBe(true);
  });

  it('should return false when comparing two different RegistrationNumbers', () => {
    const registrationNumber1 = RegistrationNumber.fromString(
      validRegistrationNumber,
    );
    const registrationNumber2 = RegistrationNumber.fromString('XYZ-98765');
    expect(registrationNumber1.equals(registrationNumber2)).toBe(false);
  });

  it('should return the correct value when using the value getter', () => {
    const registrationNumber = RegistrationNumber.fromString(
      validRegistrationNumber,
    );
    expect(registrationNumber.value).toBe(validRegistrationNumber);
  });
});
