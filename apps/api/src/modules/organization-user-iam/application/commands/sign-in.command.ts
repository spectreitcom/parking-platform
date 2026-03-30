import { ICommand } from '@nestjs/cqrs';

export class SignInCommand implements ICommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {}
}
