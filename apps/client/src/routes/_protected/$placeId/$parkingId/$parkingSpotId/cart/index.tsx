import { useServerFn } from '@tanstack/react-start';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  ArrowLeft,
  CalendarClock,
  Car,
  Clock3,
  CreditCard,
  PackagePlus,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert.tsx';
import { Badge } from '#/components/ui/badge.tsx';
import { Button } from '#/components/ui/button.tsx';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '#/components/ui/card.tsx';
import { Field, FieldError, FieldLabel } from '#/components/ui/field.tsx';
import { Input } from '#/components/ui/input.tsx';
import { Spinner } from '#/components/ui/spinner.tsx';
import { createCart, getCart, updateCart } from '#/features/cart/api';
import type { getCartResponseSchema } from '#/features/cart/schemas';
import { createReservation } from '#/features/reservations/api';
import { z } from 'zod';

type Cart = z.infer<typeof getCartResponseSchema>;

const validateSearchSchema = z.object({
  arrival: z.coerce.number().int(), // timestamp in seconds
  departure: z.coerce.number().int(), // timestamp in seconds
});

export const Route = createFileRoute(
  '/_protected/$placeId/$parkingId/$parkingSpotId/cart/',
)({
  component: RouteComponent,
  pendingComponent: () => (
    <div className="flex min-h-[50vh] w-full items-center justify-center">
      <Spinner className={'size-8'} />
    </div>
  ),
  validateSearch: validateSearchSchema,
  loaderDeps: ({ search }) => ({
    arrival: search.arrival,
    departure: search.departure,
  }),
  loader: async ({ params, deps }) => {
    try {
      const { id } = await createCart({
        data: {
          parkingSpotId: params.parkingSpotId,
          arrival: deps.arrival,
          departure: deps.departure,
        },
      });
      const cart = await getCart({ data: { cartId: id } });

      return { cart, error: null };
    } catch (error) {
      return {
        cart: null,
        error:
          error instanceof Error
            ? error.message
            : 'Nie udało się utworzyć koszyka. Spróbuj ponownie.',
      };
    }
  },
});

function RouteComponent() {
  const { cart: initialCart, error } = Route.useLoaderData();
  const params = Route.useParams();
  const navigate = useNavigate({ from: Route.fullPath });
  const updateCartFn = useServerFn(updateCart);
  const getCartFn = useServerFn(getCart);
  const createReservationFn = useServerFn(createReservation);
  const [cart, setCart] = useState<Cart | null>(initialCart);
  const [arrival, setArrival] = useState(() =>
    initialCart ? timestampToDateTimeLocal(initialCart.arrival) : '',
  );
  const [departure, setDeparture] = useState(() =>
    initialCart ? timestampToDateTimeLocal(initialCart.departure) : '',
  );
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [reservationError, setReservationError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreatingReservation, setIsCreatingReservation] = useState(false);
  const parkingSearch = {
    arrival: cart?.arrival ?? initialCart?.arrival ?? 0,
    departure: cart?.departure ?? initialCart?.departure ?? 0,
  };

  if (error || !cart) {
    return (
      <main className="app-page max-w-4xl">
        <Alert variant="destructive">
          <AlertTitle>Koszyk jest niedostępny</AlertTitle>
          <AlertDescription>
            Nie udało się utworzyć koszyka. Spróbuj ponownie.
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline" className="w-fit">
          <Link
            to="/$placeId/$parkingId"
            params={{ placeId: params.placeId, parkingId: params.parkingId }}
            search={parkingSearch}
          >
            <ArrowLeft />
            Wróć do parkingu
          </Link>
        </Button>
      </main>
    );
  }

  const handleUpdateCart = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const arrivalTimestamp = dateTimeLocalToTimestamp(arrival);
    const departureTimestamp = dateTimeLocalToTimestamp(departure);

    if (!arrivalTimestamp || !departureTimestamp) {
      setUpdateError('Wybierz godzinę przyjazdu i wyjazdu.');
      return;
    }

    if (departureTimestamp <= arrivalTimestamp) {
      setUpdateError('Wyjazd musi być później niż przyjazd.');
      return;
    }

    setIsUpdating(true);
    setUpdateError(null);

    try {
      const updatedCart = await updateCartFn({
        data: {
          cartId: cart.id,
          arrival: arrivalTimestamp,
          departure: departureTimestamp,
          addonIds: cart.addons.map((addon) => addon.id),
        },
      });
      const refreshedCart = await getCartFn({
        data: { cartId: updatedCart.id },
      });

      setCart(refreshedCart);
      setArrival(timestampToDateTimeLocal(refreshedCart.arrival));
      setDeparture(timestampToDateTimeLocal(refreshedCart.departure));
      toast.success('Termin został zaktualizowany');
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'Nie udało się zaktualizować terminu. Spróbuj ponownie.';

      setUpdateError(message);
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMakeReservation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedRegistrationNumber = registrationNumber.trim();

    if (!normalizedRegistrationNumber) {
      setReservationError('Wpisz numer rejestracyjny pojazdu.');
      return;
    }

    setIsCreatingReservation(true);
    setReservationError(null);

    try {
      const reservation = await createReservationFn({
        data: {
          cartId: cart.id,
          registrationNumber: normalizedRegistrationNumber,
        },
      });

      toast.success('Rezerwacja została utworzona');
      await navigate({
        to: '/reservations/$reservationId',
        params: { reservationId: reservation.id },
      });
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'Nie udało się utworzyć rezerwacji. Spróbuj ponownie.';

      setReservationError(message);
      toast.error(message);
    } finally {
      setIsCreatingReservation(false);
    }
  };

  return (
    <main className="app-page max-w-5xl">
      <header className="flex flex-col gap-5">
        <Button asChild variant="link" className="h-auto w-fit px-0">
          <Link
            to="/$placeId/$parkingId"
            params={{ placeId: params.placeId, parkingId: params.parkingId }}
            search={parkingSearch}
          >
            <ArrowLeft />
            Wróć do parkingu
          </Link>
        </Button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <Badge variant="secondary" className="w-fit">
              Podsumowanie
            </Badge>
            <h1 className="page-title">Twoja rezerwacja</h1>
            <p className="text-muted-foreground">
              Sprawdź szczegóły i podaj numer rejestracyjny pojazdu.
            </p>
          </div>
          <div className="surface-panel px-5 py-4">
            <p className="text-sm font-medium text-muted-foreground">Łącznie</p>
            <p className="text-3xl font-semibold">{formatMoney(cart.total)}</p>
          </div>
        </div>
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
              value={formatTimestamp(cart.arrival)}
              icon={<Clock3 />}
            />
            <Detail
              label="Wyjazd"
              value={formatTimestamp(cart.departure)}
              icon={<Clock3 />}
            />
            <Detail
              label="Czas rezerwacji"
              value={formatDays(cart.days)}
              icon={<CalendarClock />}
            />
            <Detail
              label="Cena za dzień"
              value={formatMoney(cart.pricePerDay)}
              icon={<CreditCard />}
            />
            <Detail
              label="Miejsce parkingowe"
              value={shortId(cart.parkingSpotId)}
              icon={<Car />}
            />
            <Detail
              label="Numer koszyka"
              value={shortId(cart.id)}
              icon={<ReceiptText />}
            />
          </CardContent>
        </Card>

        <Card className="gap-5 py-5">
          <CardHeader className="px-5">
            <CardTitle className="flex items-center gap-2 text-lg">
              <PackagePlus className="size-5 text-primary" />
              Usługi dodatkowe
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5">
            {cart.addons.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nie wybrano żadnych usług dodatkowych.
              </p>
            ) : (
              <div className="grid gap-3">
                {cart.addons.map((addon) => (
                  <div
                    key={addon.id}
                    className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm"
                  >
                    <span>Usługa {shortId(addon.id)}</span>
                    <span className="font-semibold">
                      {formatPln(addon.price)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="gap-5 py-5 lg:col-start-2">
          <CardHeader className="px-5">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="size-5 text-primary" />
              Potwierdź
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5">
            <form className="grid gap-4" onSubmit={handleMakeReservation}>
              <Field>
                <FieldLabel htmlFor="registration-number">
                  Numer rejestracyjny
                </FieldLabel>
                <Input
                  id="registration-number"
                  value={registrationNumber}
                  onChange={(event) =>
                    setRegistrationNumber(event.target.value)
                  }
                  placeholder="KR 12345"
                  disabled={isCreatingReservation}
                  autoComplete="off"
                />
                {reservationError ? (
                  <FieldError>{reservationError}</FieldError>
                ) : null}
              </Field>
              <Button type="submit" disabled={isCreatingReservation}>
                {isCreatingReservation ? <Spinner /> : <ShieldCheck />}
                Zarezerwuj miejsce
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="gap-5 py-5 lg:col-span-2">
          <CardHeader className="px-5">
            <CardTitle className="flex items-center gap-2 text-lg">
              <RefreshCw className="size-5 text-primary" />
              Zmień termin
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5">
            <form
              className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end"
              onSubmit={handleUpdateCart}
            >
              <Field>
                <FieldLabel htmlFor="cart-arrival">Przyjazd</FieldLabel>
                <Input
                  id="cart-arrival"
                  type="datetime-local"
                  value={arrival}
                  onChange={(event) => setArrival(event.target.value)}
                  disabled={isUpdating}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="cart-departure">Wyjazd</FieldLabel>
                <Input
                  id="cart-departure"
                  type="datetime-local"
                  value={departure}
                  onChange={(event) => setDeparture(event.target.value)}
                  disabled={isUpdating}
                />
              </Field>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? <Spinner /> : <RefreshCw />}
                Aktualizuj termin
              </Button>
              {updateError ? (
                <FieldError className="md:col-span-3">{updateError}</FieldError>
              ) : null}
            </form>
          </CardContent>
        </Card>
      </div>
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

function timestampToDateTimeLocal(timestamp: number) {
  const date = new Date(timestamp * 1000);
  const timezoneOffsetMs = date.getTimezoneOffset() * 60 * 1000;

  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 16);
}

function dateTimeLocalToTimestamp(value: string) {
  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return null;
  }

  return Math.floor(timestamp / 1000);
}

function formatMoney(valueInCents: number) {
  return formatPln(valueInCents / 100);
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

function formatDays(days: number) {
  if (days === 1) return '1 dzień';
  if (days > 1 && days < 5) return `${days} dni`;
  return `${days} dni`;
}
