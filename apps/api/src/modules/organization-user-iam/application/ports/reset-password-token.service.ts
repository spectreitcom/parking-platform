export abstract class ResetPasswordTokenService {
  abstract createHash(plainResetPasswordToken: string): string;
}
