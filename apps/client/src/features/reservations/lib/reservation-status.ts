export type ReservationStatusKind =
  'cancelled' | 'confirmed' | 'completed' | 'pending' | 'unknown';

const statusLabels: Record<
  Exclude<ReservationStatusKind, 'unknown'>,
  string
> = {
  cancelled: 'Anulowana',
  confirmed: 'Potwierdzona',
  completed: 'Zakończona',
  pending: 'Oczekująca',
};

export function getReservationStatusKind(
  status: string,
): ReservationStatusKind {
  const normalized = status.toLowerCase();

  if (normalized.includes('cancel')) return 'cancelled';
  if (normalized.includes('confirm') || normalized.includes('active'))
    return 'confirmed';
  if (normalized.includes('complete') || normalized.includes('finish'))
    return 'completed';
  if (normalized.includes('pending')) return 'pending';

  return 'unknown';
}

export function getReservationStatusLabel(status: string) {
  const kind = getReservationStatusKind(status);

  return kind === 'unknown' ? status : statusLabels[kind];
}

export function isReservationCancelled(status: string) {
  return getReservationStatusKind(status) === 'cancelled';
}
