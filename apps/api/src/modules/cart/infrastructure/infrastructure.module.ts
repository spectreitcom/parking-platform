import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../shared/prisma/prisma.module';
import { CartRepository } from '../application/ports/cart.repository';
import { PrismaCartRepository } from './persistence/prisma-cart.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: CartRepository,
      useClass: PrismaCartRepository,
    },
  ],
  exports: [CartRepository],
})
export class InfrastructureModule {}
