import { IQuery } from '@nestjs/cqrs';

export class GetAdminUsersTotalQuery implements IQuery {
  constructor(public readonly search?: string) {}
}
