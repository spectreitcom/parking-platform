export class AdminUserDetailsReadModel {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly displayName: string,
    public readonly isSuperAdmin: boolean,
  ) {}
}
