import { Email } from './index';

export class OrganizationUserWelcomeEmail extends Email<{
  resetPasswordToken: string;
  displayName: string;
}> {
  constructor(
    private readonly _to: string,
    private readonly resetPasswordToken: string,
    private readonly displayName: string,
  ) {
    super();
  }

  get to() {
    return this._to;
  }

  get subject() {
    return 'Welcome to the organization';
  }

  get context() {
    return {
      resetPasswordToken: this.resetPasswordToken,
      displayName: this.displayName,
    };
  }

  get template() {
    return 'organization-user-welcome';
  }
}
