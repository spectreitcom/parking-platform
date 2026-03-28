export class OrganizationListForAdminItemReadModel {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly address: string,
    public readonly taxId: string,
    public readonly members: {
      id: string;
      isRoot: boolean;
      organizationUserId: string;
      displayName: string;
      email: string;
    }[],
    public readonly version: number,
  ) {}
}
