export abstract class ResetPasswordTokenStorage {
  abstract insert(
    adminUserId: string,
    resetPasswordTokenHash: string,
  ): Promise<void>;
  abstract validate(resetPasswordTokenHash: string): Promise<false | string>;
  abstract invalidate(resetPasswordTokenHash: string): Promise<void>;
}
