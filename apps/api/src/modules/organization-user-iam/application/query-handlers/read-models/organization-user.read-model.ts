export class OrganizationUserReadModel {
  constructor(
    public readonly id: string,
    public readonly displayName: string,
    public readonly email: string,
    public readonly statusText: string,
  ) {}
}
