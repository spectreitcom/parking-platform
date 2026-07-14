import {
  CalendarClock,
  CarFront,
  CreditCard,
  Mail,
  UserRound,
} from 'lucide-react';
import { StatusBadge } from '#/components/status-badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table.tsx';
import type { ReservationsListItemSchema } from '#/features/reservations/schemas';

type Props = Readonly<{
  items: ReservationsListItemSchema[];
}>;

const currencyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'PLN',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const statusTone: Record<
  string,
  'positive' | 'negative' | 'info' | 'neutral' | 'warning'
> = {
  CREATED: 'warning',
  PAID: 'info',
  CANCELLED: 'negative',
  COMPLETED: 'positive',
};

export function ReservationsList({ items }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[220px]">Vehicle</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((reservation) => (
          <TableRow
            key={reservation.id}
            className="transition-colors hover:bg-muted/50"
          >
            <TableCell className="font-medium">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background text-primary shadow-xs">
                  <CarFront className="size-4" />
                </div>
                <span className="truncate text-foreground">
                  {reservation.registrationNumber}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <UserRound className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {reservation.user.name}
                  </p>
                  <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                    <Mail className="size-3 shrink-0" />
                    {reservation.user.email}
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <StatusBadge
                tone={statusTone[reservation.status.toUpperCase()] ?? 'neutral'}
              >
                {formatStatus(reservation.status)}
              </StatusBadge>
            </TableCell>
            <TableCell>
              {reservation.payment ? (
                <div className="flex items-center gap-2">
                  <CreditCard className="size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">
                      {currencyFormatter.format(
                        reservation.payment.amount / 100,
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {reservation.payment.paidAt ? 'Paid' : 'Pending'}
                    </p>
                  </div>
                </div>
              ) : (
                <span className="text-muted-foreground">Not available</span>
              )}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarClock className="size-4 shrink-0" />
                <span>{dateTimeFormatter.format(reservation.createdAt)}</span>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function formatStatus(status: string) {
  const normalizedStatus = status.trim().toLowerCase().replaceAll('_', ' ');

  return normalizedStatus.replace(/^\w/, (character) =>
    character.toUpperCase(),
  );
}
