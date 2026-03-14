import { IQuery } from '@nestjs/cqrs';

export class GetCartByIdQuery implements IQuery {
  constructor(
    public readonly cartId: string,
    public readonly userId?: string,
  ) {}
}
