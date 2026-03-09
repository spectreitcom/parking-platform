export class AdminUsersListItemReadModel {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly displayName: string,
    public readonly statusText: string,
  ) {}
}
