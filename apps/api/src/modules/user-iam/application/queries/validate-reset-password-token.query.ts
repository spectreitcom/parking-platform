import { IQuery } from '@nestjs/cqrs';

export class ValidateResetPasswordTokenQuery implements IQuery {
  constructor(public readonly resetPasswordToken: string) {}
}
