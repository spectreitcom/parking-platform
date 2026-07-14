import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevMakePaymentCommand } from '../commands/dev-make-payment.command';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { AppError } from 'src/shared/errors';

@CommandHandler(DevMakePaymentCommand)
export class DevMakePaymentCommandHandler implements ICommandHandler<
  DevMakePaymentCommand,
  string
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(command: DevMakePaymentCommand): Promise<string> {
    const { userId, reservationId } = command;

    const payment = await this.prismaService.payment.findUnique({
      where: { reservationId, paidAt: null },
    });

    if (!payment) throw new AppError('VALIDATION_ERROR', 'Payment not found');

    if (userId !== payment.userId)
      throw new AppError(
        'FORBIDDEN_OPERATION',
        'User is not authorized to make this payment',
      );

    await this.prismaService.payment.update({
      where: { reservationId },
      data: {
        paidAt: new Date(),
      },
    });

    return payment.id;
  }
}
