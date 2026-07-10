import { Badge } from '#/components/ui/badge.tsx';
import {
  getReservationStatusKind,
  getReservationStatusLabel,
} from '#/features/reservations/lib/reservation-status.ts';

export function ReservationStatusBadge({
  status,
}: Readonly<{ status: string }>) {
  const variant =
    getReservationStatusKind(status) === 'cancelled' ? 'secondary' : 'default';

  return <Badge variant={variant}>{getReservationStatusLabel(status)}</Badge>;
}
