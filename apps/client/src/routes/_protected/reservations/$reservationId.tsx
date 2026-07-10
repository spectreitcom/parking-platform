import { useServerFn } from '@tanstack/react-start';
import { Link, createFileRoute, useRouter } from '@tanstack/react-router';
import {
  ArrowLeft,
  CalendarClock,
  Car,
  Clock3,
  CreditCard,
  Ban,
  MapPin,
  ReceiptText,
  ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert.tsx';
import { Badge } from '#/components/ui/badge.tsx';
import { Button } from '#/components/ui/button.tsx';
import { ConfirmDialog } from '#/components/confirm-dialog.tsx';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '#/components/ui/card.tsx';
import { Spinner } from '#/components/ui/spinner.tsx';
import {
  cancelReservation,
  reservationDetails,
} from '#/features/reservations/api';

export const Route = createFileRoute('/_protected/reservations/$reservationId')(
  {
    component: RouteComponent,
    pendingComponent: () => (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner className="size-8" />
      </div>
    ),
    loader: async ({ params }) => {
      try {
        const reservation = await reservationDetails({
          data: { reservationId: params.reservationId },
        });

        return { reservation, error: null };
      } catch (error) {
        return {
          reservation: null,
          error:
            error instanceof Error
              ? error.message
              : 'The reservation details could not be loaded.',
        };
      }
    },
  },
);

function RouteComponent() {
  const { reservation, error } = Route.useLoaderData();
  const router = useRouter();
  const cancelReservationFn = useServerFn(cancelReservation);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  if (error || !reservation) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10 lg:px-8">
        <Alert variant="destructive">
          <AlertTitle>Reservation unavailable</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button asChild variant="outline" className="w-fit">
          <Link to="/reservations">
            <ArrowLeft />
            Back to reservations
          </Link>
        </Button>
      </div>
    );
  }

  const canCancel =
    reservation.canCancel ??
    !reservation.status.toLowerCase().includes('cancel');

  const handleCancelReservation = async () => {
    setIsCancelling(true);
    setCancelError(null);

    try {
      await cancelReservationFn({
        data: {
          reservationId: reservation.reservationId,
          version: reservation.version,
        },
      });

      toast.success('Reservation cancelled');
      setIsCancelDialogOpen(false);
      await router.invalidate();
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'The reservation could not be cancelled. Please try again.';

      setCancelError(message);
      toast.error(message);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10 lg:px-8">
      <header className="flex flex-col gap-5">
        <Button asChild variant="link" className="h-auto w-fit px-0">
          <Link to="/reservations">
            <ArrowLeft />
            Back to reservations
          </Link>
        </Button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <Badge variant="secondary" className="w-fit">
              {reservation.status}
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Reservation {shortId(reservation.reservationId)}
            </h1>
            <p className="text-muted-foreground">
              {reservation.parking.name}, {reservation.parking.address}
            </p>
          </div>
          <div className="rounded-lg border bg-card px-5 py-4 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Total</p>
            <p className="text-3xl font-semibold">
              {formatPln(reservation.total / 100)}
            </p>
          </div>
        </div>
        {cancelError ? (
          <Alert variant="destructive">
            <AlertTitle>Cancellation failed</AlertTitle>
            <AlertDescription>{cancelError}</AlertDescription>
          </Alert>
        ) : null}
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="gap-5 py-5">
          <CardHeader className="px-5">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarClock className="size-5 text-primary" />
              Booking details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 px-5 sm:grid-cols-2">
            <Detail
              label="Arrival"
              value={formatTimestamp(reservation.arrival)}
              icon={<Clock3 />}
            />
            <Detail
              label="Departure"
              value={formatTimestamp(reservation.departure)}
              icon={<Clock3 />}
            />
            <Detail
              label="Registration"
              value={reservation.registrationNumber}
              icon={<Car />}
            />
            <Detail
              label="Parking spot"
              value={shortId(reservation.parkingSpot.id)}
              icon={<MapPin />}
            />
            <Detail
              label="Price per day"
              value={formatPln(reservation.parkingSpot.pricePLN)}
              icon={<CreditCard />}
            />
            <Detail
              label="Version"
              value={reservation.version.toString()}
              icon={<ShieldCheck />}
            />
          </CardContent>
        </Card>

        <Card className="gap-5 py-5">
          <CardHeader className="px-5">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ReceiptText className="size-5 text-primary" />
              Charges
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5">
            {reservation.lines.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No charges have been added.
              </p>
            ) : (
              <div className="grid gap-3">
                {reservation.lines.map((line) => (
                  <div
                    key={`${line.title}-${line.price}`}
                    className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm"
                  >
                    <span>{line.title}</span>
                    <span className="font-semibold">
                      {formatPln(line.price / 100)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {canCancel ? (
          <Card className="gap-5 py-5 lg:col-span-2">
            <CardHeader className="px-5">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Ban className="size-5 text-destructive" />
                Reservation actions
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 px-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Cancel this reservation if you no longer need the parking spot.
              </p>
              <Button
                type="button"
                variant="destructive"
                onClick={() => setIsCancelDialogOpen(true)}
                disabled={isCancelling}
                className="w-full sm:w-fit"
              >
                <Ban />
                Cancel reservation
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <Card className="gap-5 py-5 lg:col-span-2">
          <CardHeader className="px-5">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="size-5 text-primary" />
              Parking
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 px-5 sm:grid-cols-2 lg:grid-cols-4">
            <Detail
              label="Name"
              value={reservation.parking.name}
              icon={<MapPin />}
            />
            <Detail
              label="Address"
              value={reservation.parking.address}
              icon={<MapPin />}
            />
            <Detail
              label="Reservation number"
              value={shortId(reservation.reservationId)}
              icon={<ReceiptText />}
            />
            <Detail
              label="Cart number"
              value={shortId(reservation.cartId)}
              icon={<ReceiptText />}
            />
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        title="Cancel reservation?"
        description="This will cancel the reservation and release the parking spot. This action cannot be undone."
        confirmText="Cancel reservation"
        variant="destructive"
        isLoading={isCancelling}
        onConfirm={handleCancelReservation}
      />
    </div>
  );
}

function Detail({
  label,
  value,
  icon,
}: Readonly<{ label: string; value: string; icon: React.ReactNode }>) {
  return (
    <div className="flex items-start gap-3 rounded-md border p-3">
      <span className="mt-0.5 text-primary [&_svg]:size-4">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="break-words font-semibold">{value}</p>
      </div>
    </div>
  );
}

function formatTimestamp(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp * 1000));
}

function formatPln(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'PLN',
  }).format(value);
}

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}
