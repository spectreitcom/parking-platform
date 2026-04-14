import { Email } from './index';

export class ResetPasswordEmail extends Email<{ resetPasswordToken: string }> {
  constructor(
    private readonly _to: string,
    private readonly resetPasswordToken: string,
  ) {
    super();
  }

  get context(): { resetPasswordToken: string } {
    return { resetPasswordToken: this.resetPasswordToken };
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
