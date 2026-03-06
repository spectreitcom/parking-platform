export abstract class RefreshTokenStorage {
  abstract insert(adminUserId: string, tokenId: string): Promise<void>;
  abstract validate(adminUserId: string, tokenId: string): Promise<boolean>;
  abstract invalidate(adminUserId: string): Promise<void>;
}
