import { IQuery } from '@nestjs/cqrs';

export class GetOrganizationByIdsQuery implements IQuery {
  constructor(public readonly ids: string[]) {}
}
