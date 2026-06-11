import { Email } from './index';

export class OrganizationUserWelcomeEmail extends Email<{
  resetPasswordToken: string;
  displayName: string;
  appUrl: string;
}> {
  constructor(
    private readonly _to: string,
    private readonly resetPasswordToken: string,
    private readonly displayName: string,
    private readonly appUrl: string,
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
      appUrl: this.appUrl,
    };
  }

  get template() {
    return 'organization-user-welcome';
  }
}
