import { Link } from '@tanstack/react-router';
import {
  CalendarClock,
  Car,
  Clock3,
  CreditCard,
  Eye,
  MapPin,
} from 'lucide-react';
import { Badge } from '#/components/ui/badge.tsx';
import { Button } from '#/components/ui/button.tsx';
import { Card, CardContent } from '#/components/ui/card.tsx';
import { ReservationStatusBadge } from '#/features/reservations/components/reservation-status-badge.tsx';
import type { ReservationListItem } from '#/features/reservations/schemas';
import { formatDateTime, formatPln, shortId } from '#/lib/formatters.ts';

export function ReservationsList({
  reservations,
}: Readonly<{ reservations: Array<ReservationListItem> }>) {
  return (
    <>
      <div className="hidden rounded-md border md:block">
        <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)_110px] gap-4 border-b bg-muted/40 px-4 py-3 text-xs font-medium text-muted-foreground">
          <span>Parking</span>
          <span>Rezerwacja</span>
          <span>Termin</span>
          <span>Płatność</span>
          <span className="text-right">Akcja</span>
        </div>
        {reservations.map((reservation) => (
          <div
            key={reservation.id}
            className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)_110px] gap-4 border-b px-4 py-4 last:border-b-0"
          >
            <ReservationParking reservation={reservation} />
            <ReservationMeta reservation={reservation} />
            <ReservationTime reservation={reservation} />
            <ReservationPayment reservation={reservation} />
            <div className="flex justify-end">
              <ReservationLink reservationId={reservation.id} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 md:hidden">
        {reservations.map((reservation) => (
          <Card key={reservation.id} className="gap-4 py-4">
            <CardContent className="flex flex-col gap-4 px-4">
              <div className="flex items-start justify-between gap-3">
                <ReservationParking reservation={reservation} />
                <ReservationStatusBadge status={reservation.status} />
              </div>
              <div className="grid gap-3 text-sm">
                <ReservationMeta reservation={reservation} />
                <ReservationTime reservation={reservation} />
                <ReservationPayment reservation={reservation} />
              </div>
              <ReservationLink reservationId={reservation.id} isMobile />
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

function ReservationLink({
  reservationId,
  isMobile = false,
}: Readonly<{ reservationId: string; isMobile?: boolean }>) {
  return (
    <Button
      asChild
      variant="outline"
      size={isMobile ? 'default' : 'sm'}
      className={isMobile ? 'w-full' : undefined}
    >
      <Link to="/reservations/$reservationId" params={{ reservationId }}>
        <Eye />
        {isMobile ? 'Zobacz rezerwację' : 'Zobacz'}
      </Link>
    </Button>
  );
}

function ReservationParking({
  reservation,
}: Readonly<{ reservation: ReservationListItem }>) {
  return (
    <div className="min-w-0">
      <p className="truncate font-semibold">{reservation.parking.name}</p>
      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
        <MapPin className="size-3.5 shrink-0" />
        <span className="truncate">
          Miejsce {shortId(reservation.parkingSpotId)}
        </span>
      </p>
    </div>
  );
}

function ReservationMeta({
  reservation,
}: Readonly<{ reservation: ReservationListItem }>) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex items-center gap-2">
        <ReservationStatusBadge status={reservation.status} />
        {reservation.canEdit ? (
          <Badge variant="outline" className="hidden lg:inline-flex">
            Można edytować
          </Badge>
        ) : null}
      </div>
      <p className="flex items-center gap-1 text-sm text-muted-foreground">
        <Car className="size-3.5 shrink-0" />
        <span className="truncate">{reservation.registrationNumber}</span>
      </p>
    </div>
  );
}

function ReservationTime({
  reservation,
}: Readonly<{ reservation: ReservationListItem }>) {
  return (
    <div className="grid gap-1 text-sm">
      <p className="flex items-center gap-1 text-muted-foreground">
        <Clock3 className="size-3.5 shrink-0" />
        <span>{formatDateTime(reservation.arrivalDate)}</span>
      </p>
      <p className="flex items-center gap-1 text-muted-foreground">
        <CalendarClock className="size-3.5 shrink-0" />
        <span>{formatDateTime(reservation.departureDate)}</span>
      </p>
    </div>
  );
}

function ReservationPayment({
  reservation,
}: Readonly<{ reservation: ReservationListItem }>) {
  if (!reservation.payment) {
    return (
      <p className="flex items-center gap-1 text-sm text-muted-foreground">
        <CreditCard className="size-3.5 shrink-0" />
        <span>Brak danych</span>
      </p>
    );
  }

  return (
    <div className="flex min-w-0 items-start gap-2 text-sm">
      <CreditCard className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="font-medium">
          {formatPln(reservation.payment.amount / 100)}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {reservation.payment.paidAt
            ? `Opłacono ${formatDateTime(reservation.payment.paidAt)}`
            : 'Oczekuje na płatność'}
        </p>
      </div>
    </div>
  );
}
