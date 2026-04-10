export abstract class PasswordService {
  abstract create(password: string): Promise<string>;
  abstract compare(hash: string, password: string): Promise<boolean>;
}
