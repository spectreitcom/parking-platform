import { IQuery } from '@nestjs/cqrs';

export class GetOrganizationUsersTotalQuery implements IQuery {
  constructor(public readonly search?: string) {}
}
