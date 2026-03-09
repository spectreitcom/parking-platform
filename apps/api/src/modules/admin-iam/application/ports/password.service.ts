export abstract class PasswordService {
  abstract create(plainPassword: string): Promise<string>;
  abstract compare(
    passwordHash: string,
    plainPassword: string,
  ): Promise<boolean>;
}
