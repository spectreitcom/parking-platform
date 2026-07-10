import { Link, createFileRoute } from '@tanstack/react-router';
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  Car,
  CheckCircle2,
  MapPin,
  Navigation,
  XCircle,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert.tsx';
import { Badge } from '#/components/ui/badge.tsx';
import { Button } from '#/components/ui/button.tsx';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '#/components/ui/card.tsx';
import { Spinner } from '#/components/ui/spinner.tsx';
import { AssetImage } from '#/features/assets/components/asset-image.tsx';
import { getParkingDetails } from '#/features/parkings/api';
import { getPlaceDetails } from '#/features/places/api';
import { z } from 'zod';
import { getFeatures } from '#/features/features/api';
import { isAuthenticated } from '#/features/auth/api';

const validateSearchSchema = z.object({
  arrival: z.coerce.number().int(), // timestamp in seconds
  departure: z.coerce.number().int(), // timestamp in seconds
});

export const Route = createFileRoute('/$placeId/$parkingId')({
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
      const [parkingDetails, place, features, authenticated] =
        await Promise.all([
          getParkingDetails({
            data: {
              parkingId: params.parkingId,
              arrival: deps.arrival,
              departure: deps.departure,
            },
          }),
          getPlaceDetails({ data: { placeId: params.placeId } }),
          getFeatures(),
          isAuthenticated(),
        ]);

      return {
        parkingDetails,
        place: place,
        features,
        authenticated,
        error: null,
      };
    } catch (error) {
      return {
        parkingDetails: null,
        place: null,
        features: null,
        authenticated: false,
        error: 'Failed to fetch data. Try again later',
      };
    }
  },
});

function RouteComponent() {
  const { parkingDetails, place, authenticated, error } = Route.useLoaderData();
  const params = Route.useParams();
  const search = Route.useSearch();

  if (error || !parkingDetails) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10 lg:px-8">
        <Alert variant="destructive">
          <AlertTitle>Parking details unavailable</AlertTitle>
          <AlertDescription>
            Failed to fetch data. Try again later
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline" className="w-fit">
          <Link
            to="/$placeId"
            params={{ placeId: params.placeId }}
            search={{
              arrival: search.arrival,
              departure: search.departure,
            }}
          >
            <ArrowLeft />
            Back to results
          </Link>
        </Button>
      </div>
    );
  }

  const availableSpots = parkingDetails.parkingSpots.filter(
    (spot) => spot.available,
  );
  const lowestPrice = getLowestPrice(availableSpots);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 lg:px-8">
      <header className="flex flex-col gap-5">
        <Button asChild variant="link" className="h-auto w-fit px-0">
          <Link
            to="/$placeId"
            params={{ placeId: params.placeId }}
            search={{
              arrival: search.arrival,
              departure: search.departure,
            }}
          >
            <ArrowLeft />
            Back to results
          </Link>
        </Button>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                {availableSpots.length} available
              </Badge>
              <Badge variant="outline">
                {parkingDetails.organization.name}
              </Badge>
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                {parkingDetails.name}
              </h1>
              <p className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                <span>{parkingDetails.address}</span>
              </p>
            </div>
          </div>

          <div className="grid gap-3 rounded-lg border bg-card/80 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-muted-foreground">
                From
              </span>
              <span className="text-2xl font-semibold">
                {lowestPrice === null
                  ? 'Unavailable'
                  : `${lowestPrice.toFixed(2)} PLN`}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 border-t pt-3 text-sm">
              <ReservationTime label="Arrival" value={search.arrival} />
              <ReservationTime label="Departure" value={search.departure} />
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(220px,1fr)]">
        {parkingDetails.assetIds[0] ? (
          <AssetImage
            assetId={parkingDetails.assetIds[0]}
            alt={parkingDetails.name}
            width={960}
            height={540}
            className="rounded-lg"
          />
        ) : (
          <div className="flex aspect-video items-center justify-center rounded-lg border bg-muted text-sm text-muted-foreground">
            No image available
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
          {parkingDetails.assetIds.slice(1, 3).map((assetId) => (
            <AssetImage
              key={assetId}
              assetId={assetId}
              alt={parkingDetails.name}
              width={480}
              height={270}
              className="rounded-lg"
            />
          ))}
          {parkingDetails.assetIds.length <= 1 ? (
            <div className="grid gap-3 rounded-lg border bg-card/80 p-4 text-sm">
              <SummaryRow
                icon={<Navigation />}
                label="Coordinates"
                value={`${parkingDetails.latitude.toFixed(5)}, ${parkingDetails.longitude.toFixed(5)}`}
              />
              <SummaryRow
                icon={<Building2 />}
                label="Place"
                value={place.name}
              />
            </div>
          ) : null}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <main className="flex flex-col gap-6">
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Car className="size-5 text-primary" />
              <h2 className="text-xl font-semibold tracking-tight">
                Parking spots
              </h2>
            </div>

            {parkingDetails.parkingSpots.length === 0 ? (
              <Alert>
                <AlertTitle>No spots listed</AlertTitle>
                <AlertDescription>
                  This parking does not have reservable spots for the selected
                  time.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid gap-3">
                {parkingDetails.parkingSpots.map((spot, index) => (
                  <Card key={spot.id} className="gap-4 py-5">
                    <CardHeader className="gap-3 px-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex flex-col gap-2">
                          <CardTitle className="text-base">
                            Spot {index + 1}
                          </CardTitle>
                          <div className="flex flex-wrap gap-2">
                            {spot.parkingSpotFeatures.length > 0 ? (
                              spot.parkingSpotFeatures.map((feature) => (
                                <Badge key={feature.id} variant="outline">
                                  {feature.name}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                No listed spot features
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant={spot.available ? 'default' : 'secondary'}
                        >
                          {spot.available ? <CheckCircle2 /> : <XCircle />}
                          {spot.available ? 'Available' : 'Unavailable'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="grid gap-3 px-5 sm:grid-cols-2">
                      <PriceMetric
                        label="Total"
                        value={`${spot.priceTotalPLN.toFixed(2)} PLN`}
                      />
                      <PriceMetric
                        label="Per day"
                        value={`${spot.pricePerDayPLN.toFixed(2)} PLN`}
                      />
                      {authenticated ? (
                        spot.available ? (
                          <Button
                            asChild
                            className="sm:col-span-2"
                            variant={'secondary'}
                          >
                            <Link
                              to="/$placeId/$parkingId/$parkingSpotId/cart"
                              preload={false}
                              params={{
                                placeId: params.placeId,
                                parkingId: params.parkingId,
                                parkingSpotId: spot.id,
                              }}
                              search={{
                                arrival: search.arrival,
                                departure: search.departure,
                              }}
                            >
                              Make reservation
                            </Link>
                          </Button>
                        ) : (
                          <Button disabled className="sm:col-span-2">
                            Make reservation
                          </Button>
                        )
                      ) : null}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </main>

        <aside className="flex flex-col gap-4">
          <Card className="gap-4 py-5">
            <CardHeader className="px-5">
              <CardTitle className="text-base">Parking details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 px-5 text-sm">
              <SummaryRow
                icon={<Building2 />}
                label="Operator"
                value={parkingDetails.organization.name}
              />
              <SummaryRow icon={<MapPin />} label="Place" value={place.name} />
              <SummaryRow
                icon={<Navigation />}
                label="Coordinates"
                value={`${parkingDetails.latitude.toFixed(5)}, ${parkingDetails.longitude.toFixed(5)}`}
              />
              <SummaryRow
                icon={<CalendarClock />}
                label="Reservation"
                value={`${formatTimestamp(search.arrival)} - ${formatTimestamp(search.departure)}`}
              />
            </CardContent>
          </Card>

          <Card className="gap-4 py-5">
            <CardHeader className="px-5">
              <CardTitle className="text-base">Features</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2 px-5">
              {parkingDetails.parkingFeatures.length > 0 ? (
                parkingDetails.parkingFeatures.map((feature) => (
                  <Badge key={feature.id} variant="outline">
                    {feature.name}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">
                  No listed parking features
                </span>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function ReservationTime({
  label,
  value,
}: Readonly<{ label: string; value: number }>) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="truncate font-semibold">{formatTimestamp(value)}</p>
    </div>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: Readonly<{
  icon: React.ReactNode;
  label: string;
  value: string;
}>) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-primary [&_svg]:size-4">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="break-words font-medium">{value}</p>
      </div>
    </div>
  );
}

function PriceMetric({
  label,
  value,
}: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-md border px-3 py-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

function getLowestPrice(
  spots: Array<{ priceTotalPLN: number }>,
): number | null {
  if (spots.length === 0) {
    return null;
  }

  return Math.min(...spots.map((spot) => spot.priceTotalPLN));
}

function formatTimestamp(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  }).format(new Date(timestamp * 1000));
}
