import { Link, createFileRoute } from '@tanstack/react-router';
import {
  ArrowLeft,
  CalendarClock,
  Car,
  Clock3,
  CreditCard,
  Ban,
  Pencil,
  MapPin,
  ReceiptText,
  Save,
  ShieldCheck,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert.tsx';
import { Badge } from '#/components/ui/badge.tsx';
import { Button } from '#/components/ui/button.tsx';
import { ConfirmDialog } from '#/components/confirm-dialog.tsx';
import { DetailItem } from '#/components/detail-item.tsx';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '#/components/ui/card.tsx';
import { Field, FieldError, FieldLabel } from '#/components/ui/field.tsx';
import { Input } from '#/components/ui/input.tsx';
import { Spinner } from '#/components/ui/spinner.tsx';
import { reservationDetails } from '#/features/reservations/api';
import { useReservationActions } from '#/features/reservations/hooks/use-reservation-actions.ts';
import { getReservationStatusLabel } from '#/features/reservations/lib/reservation-status.ts';
import type { ReservationDetails } from '#/features/reservations/schemas';
import { formatPln, formatUnixDateTime, shortId } from '#/lib/formatters.ts';

export const Route = createFileRoute('/_protected/reservations/$reservationId')(
  {
    component: RouteComponent,
    pendingComponent: () => (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
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
              : 'Nie udało się wczytać szczegółów rezerwacji.',
        };
      }
    },
  },
);

function RouteComponent() {
  const { reservation, error } = Route.useLoaderData();

  if (error || !reservation) {
    return (
      <main className="app-page max-w-4xl">
        <Alert variant="destructive">
          <AlertTitle>Rezerwacja jest niedostępna</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button asChild variant="outline" className="w-fit">
          <Link to="/reservations">
            <ArrowLeft />
            Wróć do rezerwacji
          </Link>
        </Button>
      </main>
    );
  }

  return <ReservationDetailsPage reservation={reservation} />;
}

function ReservationDetailsPage({
  reservation,
}: Readonly<{ reservation: ReservationDetails }>) {
  const {
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
  } = useReservationActions(reservation);

  return (
    <main className="app-page max-w-5xl">
      <header className="flex flex-col gap-5">
        <Button asChild variant="link" className="h-auto w-fit px-0">
          <Link to="/reservations">
            <ArrowLeft />
            Wróć do rezerwacji
          </Link>
        </Button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <Badge variant="secondary" className="w-fit">
              {getReservationStatusLabel(reservation.status)}
            </Badge>
            <h1 className="page-title">
              Rezerwacja {shortId(reservation.reservationId)}
            </h1>
            <p className="text-muted-foreground">
              {reservation.parking.name}, {reservation.parking.address}
            </p>
          </div>
          <div className="surface-panel px-5 py-4">
            <p className="text-sm font-medium text-muted-foreground">Łącznie</p>
            <p className="text-3xl font-semibold">
              {formatPln(reservation.total / 100)}
            </p>
          </div>
        </div>
        {cancelError ? (
          <Alert variant="destructive">
            <AlertTitle>Nie udało się anulować rezerwacji</AlertTitle>
            <AlertDescription>{cancelError}</AlertDescription>
          </Alert>
        ) : null}
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="gap-5 py-5">
          <CardHeader className="px-5">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarClock className="size-5 text-primary" />
              Szczegóły rezerwacji
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 px-5 sm:grid-cols-2">
            <DetailItem
              label="Przyjazd"
              value={formatUnixDateTime(reservation.arrival)}
              icon={<Clock3 />}
            />
            <DetailItem
              label="Wyjazd"
              value={formatUnixDateTime(reservation.departure)}
              icon={<Clock3 />}
            />
            <DetailItem
              label="Numer rejestracyjny"
              value={reservation.registrationNumber}
              icon={<Car />}
            />
            <DetailItem
              label="Miejsce parkingowe"
              value={shortId(reservation.parkingSpot.id)}
              icon={<MapPin />}
            />
            <DetailItem
              label="Cena za dzień"
              value={formatPln(reservation.parkingSpot.pricePLN)}
              icon={<CreditCard />}
            />
            <DetailItem
              label="Wersja"
              value={reservation.version.toString()}
              icon={<ShieldCheck />}
            />
          </CardContent>
        </Card>

        <Card className="gap-5 py-5">
          <CardHeader className="px-5">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ReceiptText className="size-5 text-primary" />
              Opłaty
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5">
            {reservation.lines.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nie dodano żadnych opłat.
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

        {canEdit || canCancel ? (
          <Card className="gap-5 py-5 lg:col-span-2">
            <CardHeader className="px-5">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Pencil className="size-5 text-primary" />
                Zarządzaj rezerwacją
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 px-5">
              {canEdit ? (
                <form className="grid gap-4" onSubmit={update}>
                  <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                    <Field>
                      <FieldLabel htmlFor="reservation-registration-number">
                        Numer rejestracyjny
                      </FieldLabel>
                      <Input
                        id="reservation-registration-number"
                        value={registrationNumber}
                        onChange={(event) =>
                          setRegistrationNumber(event.target.value)
                        }
                        placeholder="KR 12345"
                        disabled={!isEditing || isUpdating}
                        autoComplete="off"
                      />
                    </Field>
                    {isEditing ? (
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={stopEditing}
                          disabled={isUpdating}
                          className="w-full sm:w-fit"
                        >
                          Anuluj
                        </Button>
                        <Button
                          type="submit"
                          disabled={isUpdating}
                          className="w-full sm:w-fit"
                        >
                          {isUpdating ? <Spinner /> : <Save />}
                          Zapisz
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={startEditing}
                        className="w-full sm:w-fit"
                      >
                        <Pencil />
                        Edytuj
                      </Button>
                    )}
                  </div>
                  {updateError ? <FieldError>{updateError}</FieldError> : null}
                </form>
              ) : null}

              {canCancel ? (
                <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Anuluj rezerwację, jeśli nie potrzebujesz już miejsca
                    parkingowego.
                  </p>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setIsCancelDialogOpen(true)}
                    disabled={isCancelling}
                    className="w-full sm:w-fit"
                  >
                    <Ban />
                    Anuluj rezerwację
                  </Button>
                </div>
              ) : null}
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
            <DetailItem
              label="Nazwa"
              value={reservation.parking.name}
              icon={<MapPin />}
            />
            <DetailItem
              label="Adres"
              value={reservation.parking.address}
              icon={<MapPin />}
            />
            <DetailItem
              label="Numer rezerwacji"
              value={shortId(reservation.reservationId)}
              icon={<ReceiptText />}
            />
            <DetailItem
              label="Numer koszyka"
              value={shortId(reservation.cartId)}
              icon={<ReceiptText />}
            />
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        title="Anulować rezerwację?"
        description="Rezerwacja zostanie anulowana, a miejsce parkingowe zwolnione. Tej czynności nie można cofnąć."
        confirmText="Anuluj rezerwację"
        variant="destructive"
        isLoading={isCancelling}
        onConfirm={cancel}
      />
    </main>
  );
}
