import { ICommand } from '@nestjs/cqrs';

export class ChangePasswordCommand implements ICommand {
  constructor(
    public readonly organizationUserId: string,
    public readonly existingPassword: string,
    public readonly newPassword: string,
  ) {}
}
