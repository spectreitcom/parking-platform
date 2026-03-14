import { ICommand } from '@nestjs/cqrs';
import { CartAddonRaw } from '../types';

export class UpdateCartCommand implements ICommand {
  constructor(
    public readonly cartId: string,
    public readonly arrival: number,
    public readonly departure: number,
    public readonly addons: CartAddonRaw[],
  ) {}
}
