import { ICommand } from '@nestjs/cqrs';

export class CreateOrganizationCommand implements ICommand {
  constructor(
    public readonly name: string,
    public readonly address: string,
    public readonly taxId: string,
  ) {}
}
