import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { SignInCommand } from './commands/sign-in.command';
import { SignInCommandResponse } from './command-handlers/sign-in.command-handler';
import { SingOutCommand } from './commands/sing-out.command';

@Injectable()
export class AdminIamFacade {
  constructor(private readonly commandBus: CommandBus) {}

  async signIn(adminUserId: string) {
    const command = new SignInCommand(adminUserId);
    return await this.commandBus.execute<SignInCommand, SignInCommandResponse>(
      command,
    );
  }

  async singOut(adminUserId: string) {
    return await this.commandBus.execute<SingOutCommand, void>(
      new SingOutCommand(adminUserId),
    );
  }
}
