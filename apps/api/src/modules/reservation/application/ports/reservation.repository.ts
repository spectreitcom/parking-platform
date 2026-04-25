import { Reservation } from 'src/modules/reservation/domain/reservation';
import { RepositorySaveOptions } from 'src/shared/types';
import { PrismaTx } from 'src/shared/prisma/types';

export abstract class ReservationRepository {
  abstract save(
    reservation: Reservation,
    options?: RepositorySaveOptions,
  ): Promise<void>;
  abstract findById(
    reservationId: string,
    tx?: PrismaTx,
  ): Promise<Reservation | null>;
  abstract findByIdAndUserId(
    reservationId: string,
    userId: string,
    tx?: PrismaTx,
  ): Promise<Reservation | null>;
}
