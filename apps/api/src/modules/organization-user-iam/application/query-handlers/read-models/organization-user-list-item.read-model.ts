export class OrganizationUserListItemReadModel {
  constructor(
    public readonly organizationUserId: string,
    public readonly email: string,
    public readonly displayName: string,
    public readonly statusText: string,
  ) {}
}
