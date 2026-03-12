export abstract class RefreshTokenStorage {
  abstract insert(organizationUserId: string, tokenId: string): Promise<void>;
  abstract validate(
    organizationUserId: string,
    tokenId: string,
  ): Promise<boolean>;
  abstract invalidate(organizationUserId: string): Promise<void>;
}
