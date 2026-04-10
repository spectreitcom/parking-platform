import { ICommand } from '@nestjs/cqrs';

export class ResetPasswordCommand implements ICommand {
  constructor(
    public readonly resetPasswordToken: string,
    public readonly password: string,
  ) {}
}
