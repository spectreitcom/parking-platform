export class SearchedOrganizationUserItemReadModel {
  constructor(
    public readonly organizationUserId: string,
    public readonly email: string,
    public readonly displayName: string,
  ) {}
}
