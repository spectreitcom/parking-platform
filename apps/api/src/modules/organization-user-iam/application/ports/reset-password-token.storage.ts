export abstract class ResetPasswordTokenStorage {
  abstract insert(
    organizationUserId: string,
    resetPasswordTokenHash: string,
  ): Promise<void>;
  abstract validate(resetPasswordTokenHash: string): Promise<false | string>;
  abstract invalidate(resetPasswordTokenHash: string): Promise<void>;
}
