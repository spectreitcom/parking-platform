import { Email } from './index';

export class ResetPasswordEmail extends Email<{
  resetPasswordToken: string;
  appUrl: string;
}> {
  constructor(
    private readonly _to: string,
    private readonly resetPasswordToken: string,
    private readonly appUrl: string,
  ) {
    super();
  }

  get context() {
    return { resetPasswordToken: this.resetPasswordToken, appUrl: this.appUrl };
  }

  get subject(): string {
    return 'Reset password';
  }

  get template(): string {
    return 'reset-password';
  }

  get to(): string {
    return this._to;
  }
}
