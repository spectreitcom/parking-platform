import { Email } from 'src/modules/email-notification/application/email/index';

export class AdminWelcomeEmail extends Email<{ resetPasswordToken: string }> {
  constructor(
    private readonly _to: string,
    private readonly resetPasswordToken: string,
  ) {
    super();
  }

  get to(): string {
    return this._to;
  }

  get subject(): string {
    return 'You have been invited to join the platform';
  }

  get context() {
    return {
      resetPasswordToken: this.resetPasswordToken,
    };
  }

  get template(): string {
    return 'admin-welcome';
  }
}
