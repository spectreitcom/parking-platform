import { Injectable } from '@nestjs/common';
import { ReservationRepository } from 'src/modules/reservation/application/ports/reservation.repository';
import { PrismaTx } from 'src/shared/prisma/types';
import { RepositorySaveOptions } from 'src/shared/types';
import { Reservation } from '../../domain/reservation';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { ReservationMapper } from 'src/modules/reservation/infrastructure/persistence/reservation.mapper';
import { ConcurrencyError } from 'src/shared/errors';

@Injectable()
export class PrismaReservationRepository implements ReservationRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async save(
    reservation: Reservation,
    options?: RepositorySaveOptions,
  ): Promise<void> {
    const prisma = options?.tx ?? this.prismaService;
    const persistanceData = ReservationMapper.toPersistence(reservation);
    const { id, userId, version } = persistanceData;

    const isNew = options?.isNew ?? false;

    const record = await prisma.reservation.findUnique({
      where: { id, userId },
    });

    if (!record) {
      if (!isNew) {
        throw new ConcurrencyError('Reservation', id);
      }

      await prisma.reservation.create({
        data: {
          ...persistanceData,
        },
      });

      return;
    }

    try {
      await prisma.reservation.update({
        where: {
          id,
          userId,
          version,
        },
        data: {
          ...persistanceData,
          version: {
            increment: 1,
          },
        },
      });
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new ConcurrencyError('Reservation', id);
      }
      throw error;
    }
  }

  async findById(
    reservationId: string,
    tx?: PrismaTx,
  ): Promise<Reservation | null> {
    const prisma = tx ?? this.prismaService;

    const record = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!record) {
      return null;
    }

    return ReservationMapper.toDomain(record);
  }

  async findByIdAndUserId(
    reservationId: string,
    userId: string,
    tx?: PrismaTx,
  ): Promise<Reservation | null> {
    const prisma = tx ?? this.prismaService;
    const record = await prisma.reservation.findUnique({
      where: { id: reservationId, userId },
    });
    if (!record) return null;
    return ReservationMapper.toDomain(record);
  }
}
