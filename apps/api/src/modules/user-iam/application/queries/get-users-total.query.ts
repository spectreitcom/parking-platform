import { IQuery } from '@nestjs/cqrs';

export class GetUsersTotalQuery implements IQuery {
  constructor(public readonly search?: string) {}
}
