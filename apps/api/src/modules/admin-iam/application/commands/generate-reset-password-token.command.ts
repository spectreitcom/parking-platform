import { ICommand } from '@nestjs/cqrs';

export class GenerateResetPasswordTokenCommand implements ICommand {
  constructor(public readonly adminUserId: string) {}
}
