import { ICommand } from '@nestjs/cqrs';

export class UpdateOrganizationCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly address: string,
    public readonly taxId: string,
    public readonly version: number,
  ) {}
}
