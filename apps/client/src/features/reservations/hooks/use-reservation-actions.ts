import { useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  cancelReservation,
  updateReservation,
} from '#/features/reservations/api';
import { isReservationCancelled } from '#/features/reservations/lib/reservation-status.ts';
import type { ReservationDetails } from '#/features/reservations/schemas';

export function useReservationActions(reservation: ReservationDetails) {
  const router = useRouter();
  const cancelReservationFn = useServerFn(cancelReservation);
  const updateReservationFn = useServerFn(updateReservation);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [registrationNumber, setRegistrationNumber] = useState(
    reservation.registrationNumber,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const canCancel =
    reservation.canCancel ?? !isReservationCancelled(reservation.status);
  const canEdit = reservation.canEdit ?? canCancel;

  const startEditing = () => {
    setRegistrationNumber(reservation.registrationNumber);
    setUpdateError(null);
    setIsEditing(true);
  };

  const stopEditing = () => {
    setRegistrationNumber(reservation.registrationNumber);
    setUpdateError(null);
    setIsEditing(false);
  };

  const update = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedRegistrationNumber = registrationNumber.trim();

    if (!normalizedRegistrationNumber) {
      setUpdateError('Wpisz numer rejestracyjny pojazdu.');
      return;
    }

    setIsUpdating(true);
    setUpdateError(null);

    try {
      await updateReservationFn({
        data: {
          reservationId: reservation.reservationId,
          version: reservation.version,
          registrationNumber: normalizedRegistrationNumber,
        },
      });

      toast.success('Rezerwacja została zaktualizowana');
      setRegistrationNumber(normalizedRegistrationNumber);
      setIsEditing(false);
      await router.invalidate();
    } catch (error) {
      const message = getErrorMessage(
        error,
        'Nie udało się zaktualizować rezerwacji. Spróbuj ponownie.',
      );

      setUpdateError(message);
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const cancel = async () => {
    setIsCancelling(true);
    setCancelError(null);

    try {
      await cancelReservationFn({
        data: {
          reservationId: reservation.reservationId,
          version: reservation.version,
        },
      });

      toast.success('Rezerwacja została anulowana');
      setIsCancelDialogOpen(false);
      await router.invalidate();
    } catch (error) {
      const message = getErrorMessage(
        error,
        'Nie udało się anulować rezerwacji. Spróbuj ponownie.',
      );

      setCancelError(message);
      toast.error(message);
    } finally {
      setIsCancelling(false);
    }
  };

  return {
    canCancel,
    canEdit,
    cancel,
    cancelError,
    isCancelDialogOpen,
    isCancelling,
    isEditing,
    isUpdating,
    registrationNumber,
    setIsCancelDialogOpen,
    setRegistrationNumber,
    startEditing,
    stopEditing,
    update,
    updateError,
  };
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
