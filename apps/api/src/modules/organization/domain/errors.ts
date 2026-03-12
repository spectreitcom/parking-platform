export class RemovingOrganizationMemberError extends Error {
  constructor(reason?: string) {
    super(reason);
  }
}

export class AddingOrganizationMemberError extends Error {
  constructor(reason?: string) {
    super(reason);
  }
}
