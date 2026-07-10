import { useServerFn } from '@tanstack/react-start';
import { Link, createFileRoute, useRouter } from '@tanstack/react-router';
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
import type { FormEvent } from 'react';
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
import { Field, FieldError, FieldLabel } from '#/components/ui/field.tsx';
import { Input } from '#/components/ui/input.tsx';
import { Spinner } from '#/components/ui/spinner.tsx';
import {
  cancelReservation,
  reservationDetails,
  updateReservation,
} from '#/features/reservations/api';

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
  const router = useRouter();
  const cancelReservationFn = useServerFn(cancelReservation);
  const updateReservationFn = useServerFn(updateReservation);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [registrationNumber, setRegistrationNumber] = useState(
    () => reservation?.registrationNumber ?? '',
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdatingReservation, setIsUpdatingReservation] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

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

  const canCancel =
    reservation.canCancel ??
    !reservation.status.toLowerCase().includes('cancel');
  const canEdit = reservation.canEdit ?? canCancel;

  const handleStartEditing = () => {
    setRegistrationNumber(reservation.registrationNumber);
    setUpdateError(null);
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setRegistrationNumber(reservation.registrationNumber);
    setUpdateError(null);
    setIsEditing(false);
  };

  const handleUpdateReservation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedRegistrationNumber = registrationNumber.trim();

    if (!normalizedRegistrationNumber) {
      setUpdateError('Wpisz numer rejestracyjny pojazdu.');
      return;
    }

    setIsUpdatingReservation(true);
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
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'Nie udało się zaktualizować rezerwacji. Spróbuj ponownie.';

      setUpdateError(message);
      toast.error(message);
    } finally {
      setIsUpdatingReservation(false);
    }
  };

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

      toast.success('Rezerwacja została anulowana');
      setIsCancelDialogOpen(false);
      await router.invalidate();
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'Nie udało się anulować rezerwacji. Spróbuj ponownie.';

      setCancelError(message);
      toast.error(message);
    } finally {
      setIsCancelling(false);
    }
  };

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
              {translateStatus(reservation.status)}
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
            <Detail
              label="Przyjazd"
              value={formatTimestamp(reservation.arrival)}
              icon={<Clock3 />}
            />
            <Detail
              label="Wyjazd"
              value={formatTimestamp(reservation.departure)}
              icon={<Clock3 />}
            />
            <Detail
              label="Numer rejestracyjny"
              value={reservation.registrationNumber}
              icon={<Car />}
            />
            <Detail
              label="Miejsce parkingowe"
              value={shortId(reservation.parkingSpot.id)}
              icon={<MapPin />}
            />
            <Detail
              label="Cena za dzień"
              value={formatPln(reservation.parkingSpot.pricePLN)}
              icon={<CreditCard />}
            />
            <Detail
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
                <form className="grid gap-4" onSubmit={handleUpdateReservation}>
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
                        disabled={!isEditing || isUpdatingReservation}
                        autoComplete="off"
                      />
                    </Field>
                    {isEditing ? (
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancelEditing}
                          disabled={isUpdatingReservation}
                          className="w-full sm:w-fit"
                        >
                          Anuluj
                        </Button>
                        <Button
                          type="submit"
                          disabled={isUpdatingReservation}
                          className="w-full sm:w-fit"
                        >
                          {isUpdatingReservation ? <Spinner /> : <Save />}
                          Zapisz
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleStartEditing}
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
            <Detail
              label="Nazwa"
              value={reservation.parking.name}
              icon={<MapPin />}
            />
            <Detail
              label="Adres"
              value={reservation.parking.address}
              icon={<MapPin />}
            />
            <Detail
              label="Numer rezerwacji"
              value={shortId(reservation.reservationId)}
              icon={<ReceiptText />}
            />
            <Detail
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
        onConfirm={handleCancelReservation}
      />
    </main>
  );
}

function Detail({
  label,
  value,
  icon,
}: Readonly<{ label: string; value: string; icon: React.ReactNode }>) {
  return (
    <div className="metric-tile flex items-start gap-3">
      <span className="mt-0.5 text-primary [&_svg]:size-4">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="break-words font-semibold">{value}</p>
      </div>
    </div>
  );
}

function formatTimestamp(timestamp: number) {
  return new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp * 1000));
}

function formatPln(value: number) {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
  }).format(value);
}

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

function translateStatus(status: string) {
  const normalized = status.toLowerCase();

  if (normalized.includes('cancel')) return 'Anulowana';
  if (normalized.includes('confirm') || normalized.includes('active'))
    return 'Potwierdzona';
  if (normalized.includes('complete') || normalized.includes('finish'))
    return 'Zakończona';
  if (normalized.includes('pending')) return 'Oczekująca';

  return status;
}
