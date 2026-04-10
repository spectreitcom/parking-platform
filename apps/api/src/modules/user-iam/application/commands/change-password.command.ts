import { ICommand } from '@nestjs/cqrs';

export class ChangePasswordCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly existingPassword: string,
    public readonly newPassword: string,
  ) {}
}
