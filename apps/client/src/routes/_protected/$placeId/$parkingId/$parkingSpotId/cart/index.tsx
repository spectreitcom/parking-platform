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
    <div className={'flex h-full w-full items-center justify-center'}>
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
            : 'The cart could not be created. Please try again.',
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
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10 lg:px-8">
        <Alert variant="destructive">
          <AlertTitle>Cart unavailable</AlertTitle>
          <AlertDescription>
            The cart could not be created. Please try again.
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline" className="w-fit">
          <Link
            to="/$placeId/$parkingId"
            params={{ placeId: params.placeId, parkingId: params.parkingId }}
            search={parkingSearch}
          >
            <ArrowLeft />
            Back to parking
          </Link>
        </Button>
      </div>
    );
  }

  const handleUpdateCart = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const arrivalTimestamp = dateTimeLocalToTimestamp(arrival);
    const departureTimestamp = dateTimeLocalToTimestamp(departure);

    if (!arrivalTimestamp || !departureTimestamp) {
      setUpdateError('Select both arrival and departure times.');
      return;
    }

    if (departureTimestamp <= arrivalTimestamp) {
      setUpdateError('Departure must be after arrival.');
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
      toast.success('Cart updated');
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'The cart could not be updated. Please try again.';

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
      setReservationError('Enter the vehicle registration number.');
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

      toast.success('Reservation created');
      await navigate({
        to: '/reservations/$reservationId',
        params: { reservationId: reservation.id },
      });
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'The reservation could not be created. Please try again.';

      setReservationError(message);
      toast.error(message);
    } finally {
      setIsCreatingReservation(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10 lg:px-8">
      <header className="flex flex-col gap-5">
        <Button asChild variant="link" className="h-auto w-fit px-0">
          <Link
            to="/$placeId/$parkingId"
            params={{ placeId: params.placeId, parkingId: params.parkingId }}
            search={parkingSearch}
          >
            <ArrowLeft />
            Back to parking
          </Link>
        </Button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <Badge variant="secondary" className="w-fit">
              Cart created
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Your reservation
            </h1>
            <p className="text-muted-foreground">
              Review the basic booking details before continuing.
            </p>
          </div>
          <div className="rounded-lg border bg-card px-5 py-4 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Total</p>
            <p className="text-3xl font-semibold">{formatMoney(cart.total)}</p>
          </div>
        </div>
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
              value={formatTimestamp(cart.arrival)}
              icon={<Clock3 />}
            />
            <Detail
              label="Departure"
              value={formatTimestamp(cart.departure)}
              icon={<Clock3 />}
            />
            <Detail
              label="Duration"
              value={`${cart.days} ${cart.days === 1 ? 'day' : 'days'}`}
              icon={<CalendarClock />}
            />
            <Detail
              label="Price per day"
              value={formatMoney(cart.pricePerDay)}
              icon={<CreditCard />}
            />
            <Detail
              label="Parking spot"
              value={shortId(cart.parkingSpotId)}
              icon={<Car />}
            />
            <Detail
              label="Cart number"
              value={shortId(cart.id)}
              icon={<ReceiptText />}
            />
          </CardContent>
        </Card>

        <Card className="gap-5 py-5">
          <CardHeader className="px-5">
            <CardTitle className="flex items-center gap-2 text-lg">
              <PackagePlus className="size-5 text-primary" />
              Add-ons
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5">
            {cart.addons.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No additional services have been selected.
              </p>
            ) : (
              <div className="grid gap-3">
                {cart.addons.map((addon) => (
                  <div
                    key={addon.id}
                    className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm"
                  >
                    <span>Service {shortId(addon.id)}</span>
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
              Confirm
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5">
            <form className="grid gap-4" onSubmit={handleMakeReservation}>
              <Field>
                <FieldLabel htmlFor="registration-number">
                  Registration number
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
                Make reservation
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="gap-5 py-5 lg:col-span-2">
          <CardHeader className="px-5">
            <CardTitle className="flex items-center gap-2 text-lg">
              <RefreshCw className="size-5 text-primary" />
              Update reservation
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5">
            <form
              className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end"
              onSubmit={handleUpdateCart}
            >
              <Field>
                <FieldLabel htmlFor="cart-arrival">Arrival</FieldLabel>
                <Input
                  id="cart-arrival"
                  type="datetime-local"
                  value={arrival}
                  onChange={(event) => setArrival(event.target.value)}
                  disabled={isUpdating}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="cart-departure">Departure</FieldLabel>
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
                Update cart
              </Button>
              {updateError ? (
                <FieldError className="md:col-span-3">{updateError}</FieldError>
              ) : null}
            </form>
          </CardContent>
        </Card>
      </div>
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
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'PLN',
  }).format(value);
}

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}
