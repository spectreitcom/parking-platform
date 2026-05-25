import { IQuery } from '@nestjs/cqrs';

export class ValidateUserQuery implements IQuery {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {}
}
