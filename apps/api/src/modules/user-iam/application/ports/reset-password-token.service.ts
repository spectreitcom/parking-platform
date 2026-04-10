export abstract class ResetPasswordTokenService {
  abstract createHash(token: string): string;
}
