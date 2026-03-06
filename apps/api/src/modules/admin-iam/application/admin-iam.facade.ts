import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { SignInCommand } from './commands/sign-in.command';
import { SignInCommandResponse } from './command-handlers/sign-in.command-handler';

@Injectable()
export class AdminIamFacade {
  constructor(private readonly commandBus: CommandBus) {}

  async signIn(adminUserId: string) {
    const command = new SignInCommand(adminUserId);
    return await this.commandBus.execute<SignInCommand, SignInCommandResponse>(
      command,
    );
  }
}
