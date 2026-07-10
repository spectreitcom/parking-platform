import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  CalendarClock,
  Car,
  Clock3,
  Eye,
  MapPin,
  ReceiptText,
  Search,
  X,
} from 'lucide-react';
import { useState, useTransition } from 'react';
import type { FormEvent } from 'react';
import { z } from 'zod';
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert.tsx';
import { Badge } from '#/components/ui/badge.tsx';
import { Button } from '#/components/ui/button.tsx';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '#/components/ui/card.tsx';
import { Input } from '#/components/ui/input.tsx';
import { Spinner } from '#/components/ui/spinner.tsx';
import { Pagination } from '#/components/pagination.tsx';
import { getReservationsList } from '#/features/reservations/api';

const PAGE_SIZE = 10;

const validateSearchSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  search: z.string().max(100).optional().default(''),
});

export const Route = createFileRoute('/_protected/reservations/')({
  component: RouteComponent,
  pendingComponent: () => (
    <div className="flex h-full w-full items-center justify-center">
      <Spinner className="size-8" />
    </div>
  ),
  validateSearch: validateSearchSchema,
  loaderDeps: ({ search }) => ({
    page: search.page,
    search: search.search,
  }),
  loader: async ({ deps }) => {
    try {
      const reservations = await getReservationsList({
        data: {
          page: deps.page,
          limit: PAGE_SIZE,
          search: deps.search || undefined,
        },
      });

      return { reservations, error: null };
    } catch (error) {
      return {
        reservations: null,
        error:
          error instanceof Error
            ? error.message
            : 'The reservations list could not be loaded.',
      };
    }
  },
});

function RouteComponent() {
  const { reservations, error } = Route.useLoaderData();
  const searchParams = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(searchParams.search);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextSearch = searchValue.trim();

    startTransition(() => {
      void navigate({
        search: {
          page: 1,
          search: nextSearch || undefined,
        },
      });
    });
  };

  const handleClear = () => {
    setSearchValue('');

    startTransition(() => {
      void navigate({
        search: {
          page: 1,
          search: undefined,
        },
      });
    });
  };

  const handlePageChange = (page: number) => {
    startTransition(() => {
      void navigate({
        search: {
          page,
          search: searchParams.search || undefined,
        },
      });
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:px-8">
      <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="flex max-w-2xl flex-col gap-2">
          <Badge variant="secondary" className="w-fit">
            Reservations
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Your reservations
          </h1>
          <p className="text-muted-foreground">
            Review upcoming and past parking bookings, then open a reservation
            for details or cancellation.
          </p>
        </div>

        <Button asChild variant="outline" className="w-full md:w-fit">
          <Link to="/">
            <Search />
            Find parking
          </Link>
        </Button>
      </header>

      <Card className="gap-4 py-5">
        <CardHeader className="px-5">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ReceiptText className="size-5 text-primary" />
            Reservation list
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5 px-5">
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={handleSubmit}
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search by parking or registration"
                className="pr-10 pl-9"
                maxLength={100}
              />
              {searchValue ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute top-1/2 right-1 -translate-y-1/2"
                  onClick={handleClear}
                  aria-label="Clear search"
                >
                  <X />
                </Button>
              ) : null}
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Spinner /> : <Search />}
              Search
            </Button>
          </form>

          {error ? (
            <Alert variant="destructive">
              <AlertTitle>Reservations unavailable</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {!error && reservations && reservations.data.length === 0 ? (
            <Alert>
              <AlertTitle>No reservations found</AlertTitle>
              <AlertDescription>
                {searchParams.search
                  ? 'No reservations match your search.'
                  : 'You do not have any reservations yet.'}
              </AlertDescription>
            </Alert>
          ) : null}

          {!error && reservations && reservations.data.length > 0 ? (
            <div className="flex flex-col gap-3">
              <div className="hidden rounded-md border md:block">
                <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_110px] gap-4 border-b bg-muted/40 px-4 py-3 text-xs font-medium text-muted-foreground">
                  <span>Parking</span>
                  <span>Reservation</span>
                  <span>Time</span>
                  <span className="text-right">Action</span>
                </div>
                {reservations.data.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_110px] gap-4 border-b px-4 py-4 last:border-b-0"
                  >
                    <ReservationParking reservation={reservation} />
                    <ReservationMeta reservation={reservation} />
                    <ReservationTime reservation={reservation} />
                    <div className="flex justify-end">
                      <Button asChild variant="outline" size="sm">
                        <Link
                          to="/reservations/$reservationId"
                          params={{ reservationId: reservation.id }}
                        >
                          <Eye />
                          View
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 md:hidden">
                {reservations.data.map((reservation) => (
                  <Card key={reservation.id} className="gap-4 py-4">
                    <CardContent className="flex flex-col gap-4 px-4">
                      <div className="flex items-start justify-between gap-3">
                        <ReservationParking reservation={reservation} />
                        <StatusBadge status={reservation.status} />
                      </div>
                      <div className="grid gap-3 text-sm">
                        <ReservationMeta reservation={reservation} />
                        <ReservationTime reservation={reservation} />
                      </div>
                      <Button asChild variant="outline" className="w-full">
                        <Link
                          to="/reservations/$reservationId"
                          params={{ reservationId: reservation.id }}
                        >
                          <Eye />
                          View reservation
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {reservations.data.length} of {reservations.total}{' '}
                  reservations
                </p>
                <Pagination
                  total={reservations.total}
                  page={reservations.currentPage}
                  pageSize={PAGE_SIZE}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

type ReservationListItem = NonNullable<
  Awaited<ReturnType<typeof getReservationsList>>
>['data'][number];

function ReservationParking({
  reservation,
}: Readonly<{ reservation: ReservationListItem }>) {
  return (
    <div className="min-w-0">
      <p className="truncate font-semibold">{reservation.parking.name}</p>
      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
        <MapPin className="size-3.5 shrink-0" />
        <span className="truncate">Spot {shortId(reservation.parkingSpotId)}</span>
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
        <StatusBadge status={reservation.status} />
        {reservation.canEdit ? (
          <Badge variant="outline" className="hidden lg:inline-flex">
            Editable
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

function StatusBadge({ status }: Readonly<{ status: string }>) {
  const normalizedStatus = status.toLowerCase();
  const variant = normalizedStatus.includes('cancel') ? 'secondary' : 'default';

  return <Badge variant={variant}>{status}</Badge>;
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}
