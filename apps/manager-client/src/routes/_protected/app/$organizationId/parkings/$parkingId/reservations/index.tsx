import { Link, createFileRoute, redirect } from '@tanstack/react-router';
import {
  ArrowLeftIcon,
  CalendarClockIcon,
  CarFrontIcon,
  CircleSlashIcon,
  Clock3Icon,
  MailIcon,
  ReceiptTextIcon,
  SearchIcon,
  UserRoundIcon,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { z } from 'zod';

import { Pagination } from '#/components/pagination.tsx';
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert.tsx';
import { Button } from '#/components/ui/button.tsx';
import { Card, CardContent } from '#/components/ui/card.tsx';
import { Input } from '#/components/ui/input.tsx';
import { Spinner } from '#/components/ui/spinner.tsx';
import { CompleteReservationButton } from '#/features/reservations/components/complete-reservation-button.tsx';
import { reservationsList } from '#/features/reservations/api';
import type { reservationsListItemSchema } from '#/features/reservations/schemas';

type ReservationListItem = z.infer<typeof reservationsListItemSchema>;

const RESERVATIONS_PAGE_SIZE = 20;

const reservationsSearchSchema = z
  .object({
    page: z.coerce.number().int().positive().catch(1),
    search: z.string().max(100).catch(''),
  })
  .transform(({ page, search }): { page?: number; search?: string } => {
    const normalizedSearch = search.trim();

    return {
      ...(page === 1 ? {} : { page }),
      ...(normalizedSearch ? { search: normalizedSearch } : {}),
    };
  });

export const Route = createFileRoute(
  '/_protected/app/$organizationId/parkings/$parkingId/reservations/',
)({
  validateSearch: (search) => reservationsSearchSchema.parse(search),
  loaderDeps: ({ search }) => ({
    page: search.page ?? 1,
    search: search.search,
  }),
  beforeLoad: ({ context, params }) => {
    const organization = context.user.organizations.find(
      (item) => item.id === params.organizationId,
    );

    if (!organization) {
      const fallbackOrganization = context.user.organizations.at(0);

      if (fallbackOrganization) {
        throw redirect({
          to: '/app/$organizationId',
          params: { organizationId: fallbackOrganization.id },
        });
      }
    }
  },
  loader: async ({ params, deps }) => {
    try {
      const response = await reservationsList({
        data: {
          parkingId: params.parkingId,
          page: deps.page,
          limit: RESERVATIONS_PAGE_SIZE,
          search: deps.search,
        },
      });

      return {
        reservations: response.data,
        currentPage: response.currentPage,
        total: response.total,
        error: null,
      };
    } catch {
      return {
        reservations: [],
        currentPage: 1,
        total: 0,
        error: 'Failed to fetch reservations. Please try again later.',
      };
    }
  },
  component: RouteComponent,
  pendingComponent: () => (
    <div className="flex h-full w-full items-center justify-center">
      <Spinner className="size-8" />
    </div>
  ),
});

function RouteComponent() {
  const { organizationId, parkingId } = Route.useParams();
  const { search } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { reservations, currentPage, total, error } = Route.useLoaderData();

  const handlePageChange = (page: number) => {
    void navigate({
      search: (previous) => ({
        ...previous,
        page: page === 1 ? undefined : page,
      }),
    });
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const searchValue = new FormData(event.currentTarget)
      .get('search')
      ?.toString()
      .trim();

    void navigate({
      search: {
        page: undefined,
        search: searchValue || undefined,
      },
    });
  };

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link
            to="/app/$organizationId/parkings/$parkingId"
            params={{ organizationId, parkingId }}
          >
            <ArrowLeftIcon aria-hidden="true" />
            Parking details
          </Link>
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Reservations
          </h1>
          <p className="text-sm text-muted-foreground">
            Review bookings, customers, vehicles, and scheduled stays for this
            parking.
          </p>
        </div>
      </header>

      {error ? (
        <Alert variant="destructive">
          <CircleSlashIcon aria-hidden="true" />
          <AlertTitle>Reservations unavailable</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <section className="space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold tracking-tight">
                Reservation list
              </h2>
              <p className="text-sm text-muted-foreground">
                {search
                  ? `${total} ${pluralize(total, 'result')} for “${search}”`
                  : `${total} ${pluralize(total, 'reservation')}`}
              </p>
            </div>

            <form
              key={search ?? ''}
              className="flex w-full gap-2 sm:max-w-md"
              onSubmit={handleSearch}
              role="search"
            >
              <div className="relative min-w-0 flex-1">
                <SearchIcon
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  name="search"
                  defaultValue={search ?? ''}
                  maxLength={100}
                  placeholder="Search registration number"
                  aria-label="Search by registration number"
                  className="pl-9"
                />
              </div>
              <Button type="submit" variant="outline">
                Search
              </Button>
              {search ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    void navigate({ search: {} });
                  }}
                >
                  Clear
                </Button>
              ) : null}
            </form>
          </div>

          {reservations.length > 0 ? (
            <>
              <ReservationsTable reservations={reservations} />
              <div className="flex justify-end">
                <Pagination
                  total={total}
                  page={currentPage}
                  pageSize={RESERVATIONS_PAGE_SIZE}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          ) : (
            <EmptyReservations search={search} />
          )}
        </section>
      )}
    </div>
  );
}

function ReservationsTable({
  reservations,
}: Readonly<{ reservations: Array<ReservationListItem> }>) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="hidden grid-cols-[minmax(12rem,1.1fr)_minmax(12rem,1fr)_minmax(16rem,1.25fr)_minmax(7rem,0.55fr)_minmax(8rem,0.6fr)] gap-5 border-b bg-muted/40 px-5 py-3 text-xs font-medium uppercase text-muted-foreground lg:grid">
        <span>Vehicle</span>
        <span>Customer</span>
        <span>Stay</span>
        <span className="text-right">Total</span>
        <span className="text-right">Actions</span>
      </div>
      <div className="divide-y">
        {reservations.map((reservation) => (
          <article
            key={reservation.reservationId}
            className="grid gap-5 px-5 py-5 transition-colors hover:bg-muted/30 lg:grid-cols-[minmax(12rem,1.1fr)_minmax(12rem,1fr)_minmax(16rem,1.25fr)_minmax(7rem,0.55fr)_minmax(8rem,0.6fr)] lg:items-center"
          >
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted">
                <CarFrontIcon
                  aria-hidden="true"
                  className="size-5 text-muted-foreground"
                />
              </div>
              <div className="min-w-0 space-y-1.5">
                <p className="truncate font-semibold">
                  {reservation.registrationNumber}
                </p>
                <ReservationStatus status={reservation.status} />
              </div>
            </div>

            <div className="flex min-w-0 items-start gap-3 text-sm">
              <UserRoundIcon
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              />
              <div className="min-w-0">
                <p className="truncate font-medium">{reservation.user.name}</p>
                <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                  <MailIcon aria-hidden="true" className="size-3 shrink-0" />
                  {reservation.user.email}
                </p>
              </div>
            </div>

            <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <DateTime
                icon={Clock3Icon}
                label="Arrival"
                value={reservation.arrival}
              />
              <DateTime
                icon={CalendarClockIcon}
                label="Departure"
                value={reservation.departure}
              />
            </div>

            <div className="flex items-center gap-2 lg:justify-end">
              <ReceiptTextIcon
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />
              <span className="font-semibold">
                {currencyFormatter.format(reservation.total / 100)}
              </span>
            </div>

            <div className="flex items-center lg:justify-end">
              {['CREATED', 'PAID'].includes(
                reservation.status.trim().toUpperCase(),
              ) && (
                <CompleteReservationButton
                  reservationId={reservation.reservationId}
                  version={reservation.version}
                />
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function DateTime({
  icon: Icon,
  label,
  value,
}: Readonly<{
  icon: typeof Clock3Icon;
  label: string;
  value: number;
}>) {
  return (
    <div className="flex items-start gap-2">
      <Icon
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
      />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <time dateTime={new Date(value).toISOString()}>
          {dateTimeFormatter.format(value)}
        </time>
      </div>
    </div>
  );
}

function ReservationStatus({ status }: Readonly<{ status: string }>) {
  const normalizedStatus = status.trim().toUpperCase();
  const statusClassName =
    {
      CREATED:
        'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300',
      PAID: 'border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300',
      CANCELLED:
        'border-red-300 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300',
      COMPLETED:
        'border-green-300 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300',
    }[normalizedStatus] ?? 'bg-muted text-muted-foreground';

  return (
    <span
      className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${statusClassName}`}
    >
      {formatStatus(status)}
    </span>
  );
}

function EmptyReservations({ search }: Readonly<{ search?: string }>) {
  return (
    <Card className="rounded-lg border-dashed py-12 shadow-none">
      <CardContent className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-11 items-center justify-center rounded-full border bg-muted">
          <ReceiptTextIcon
            aria-hidden="true"
            className="size-5 text-muted-foreground"
          />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold">No reservations found</h3>
          <p className="max-w-md text-sm text-muted-foreground">
            {search
              ? 'No registration numbers match the current search.'
              : 'This parking does not have any reservations yet.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

const currencyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'PLN',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

function formatStatus(status: string) {
  const normalizedStatus = status.trim().toLowerCase().replaceAll('_', ' ');

  return normalizedStatus.replace(/^\w/, (character) =>
    character.toUpperCase(),
  );
}

function pluralize(value: number, noun: string) {
  return value === 1 ? noun : `${noun}s`;
}
