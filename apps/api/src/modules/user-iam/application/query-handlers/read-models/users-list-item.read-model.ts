export class UsersListItemReadModel {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly provider: string,
  ) {}
}
