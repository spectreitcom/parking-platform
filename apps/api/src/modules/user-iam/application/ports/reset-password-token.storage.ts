export abstract class ResetPasswordTokenStorage {
  abstract insert(userId: string, tokenHash: string): Promise<void>;
  abstract validate(tokenHash: string): Promise<string | false>;
  abstract invalidate(tokenHash: string): Promise<void>;
}
