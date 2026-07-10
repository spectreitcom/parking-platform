import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { ArrowRight, ListFilter, MapPin } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert.tsx';
import { Badge } from '#/components/ui/badge.tsx';
import { Button } from '#/components/ui/button.tsx';
import { Checkbox } from '#/components/ui/checkbox.tsx';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card.tsx';
import { Spinner } from '#/components/ui/spinner.tsx';
import { AssetImage } from '#/features/assets/components/asset-image.tsx';
import { getFeatures } from '#/features/features/api';
import { getPlaceDetails } from '#/features/places/api';
import { search as searchParkings } from '#/features/search/api';
import { z } from 'zod';

const validateSearchSchema = z.object({
  arrival: z.coerce.number().int(), // timestamp in seconds
  departure: z.coerce.number().int(), // timestamp in seconds
  featureIds: z.array(z.uuid()).optional().catch([]),
});

export const Route = createFileRoute('/$placeId/')({
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
    featureIds: search.featureIds ?? [],
  }),
  loader: async ({ params, deps }) => {
    try {
      const [place, searchResults, features] = await Promise.all([
        getPlaceDetails({ data: { placeId: params.placeId } }),
        searchParkings({
          data: {
            placeId: params.placeId,
            arrival: deps.arrival,
            departure: deps.departure,
            featureIds: deps.featureIds,
          },
        }),
        getFeatures(),
      ]);

      return { place, searchResults, features, error: null };
    } catch {
      return {
        place: null,
        searchResults: [],
        features: [],
        error: 'Nie udało się pobrać wyników. Spróbuj ponownie.',
      };
    }
  },
});

function RouteComponent() {
  const { place, searchResults, features, error } = Route.useLoaderData();
  const params = Route.useParams();
  const searchParams = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const selectedFeatureIds = searchParams.featureIds ?? [];

  const setFeatureSelected = (featureId: string, selected: boolean) => {
    const featureIds = selected
      ? [...selectedFeatureIds, featureId]
      : selectedFeatureIds.filter((id) => id !== featureId);

    void navigate({
      search: (previous) => ({ ...previous, featureIds }),
      replace: true,
    });
  };

  if (error) {
    return (
      <main className="app-page max-w-5xl">
        <Alert variant="destructive">
          <AlertTitle>Nie udało się wyszukać parkingów</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button asChild variant="outline" className="w-fit">
          <Link to="/">Wróć do wyszukiwania</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="app-page max-w-6xl">
      <header className="flex flex-col gap-3">
        <Button asChild variant="link" className="h-auto w-fit px-0">
          <Link to="/">Wróć do wyszukiwania</Link>
        </Button>
        <div className="flex flex-col gap-2">
          <p className="page-eyebrow">Wyniki wyszukiwania</p>
          <h1 className="page-title">{place?.name ?? 'Wybrana lokalizacja'}</h1>
          {place ? (
            <p className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-4" />
              {place.address}
            </p>
          ) : null}
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="surface-panel p-5 lg:sticky lg:top-24">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-semibold">
              <ListFilter className="size-4" />
              Filtry
            </h2>
            {selectedFeatureIds.length > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-xs"
                onClick={() =>
                  void navigate({
                    search: (previous) => ({
                      ...previous,
                      featureIds: [],
                    }),
                    replace: true,
                  })
                }
              >
                Wyczyść
              </Button>
            ) : null}
          </div>
          <fieldset className="grid gap-3">
            <legend className="mb-3 text-sm font-medium text-muted-foreground">
              Udogodnienia
            </legend>
            {features.map((feature) => (
              <label
                key={feature.id}
                className="flex cursor-pointer items-center gap-3 text-sm"
              >
                <Checkbox
                  checked={selectedFeatureIds.includes(feature.id)}
                  onCheckedChange={(checked) =>
                    setFeatureSelected(feature.id, checked === true)
                  }
                />
                <span>{feature.name}</span>
              </label>
            ))}
            {features.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Brak dostępnych filtrów
              </p>
            ) : null}
          </fieldset>
        </aside>

        {searchResults.length === 0 ? (
          <Alert>
            <AlertTitle>Brak wyników</AlertTitle>
            <AlertDescription>
              Zmień wybrane filtry albo termin rezerwacji i spróbuj ponownie.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-4">
            {searchResults.map((result) => (
              <Card
                key={result.parkingId}
                className="feature-card flex-row gap-0 overflow-hidden py-0"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-4 py-5">
                  <CardHeader className="gap-3 px-4 sm:px-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <CardTitle className="text-base leading-6">
                        {result.parkingName}
                      </CardTitle>
                      <Badge variant="secondary">
                        {result.distance.toFixed(2)} km
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.features.length > 0 ? (
                        result.features.map((feature) => (
                          <Badge key={feature.name} variant="outline">
                            {feature.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Brak opisanych udogodnień
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6">
                    <div className="metric-tile">
                      <p className="text-xs font-medium text-muted-foreground">
                        Cena łącznie
                      </p>
                      <p className="text-xl font-semibold">
                        {result.totalPricePLN === null
                          ? 'Cena niedostępna'
                          : `${result.totalPricePLN.toFixed(2)} PLN`}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="mt-auto px-4 sm:px-6">
                    <Button asChild className="w-full" variant="outline">
                      <Link
                        to="/$placeId/$parkingId"
                        params={{
                          placeId: params.placeId,
                          parkingId: result.parkingId,
                        }}
                        search={{
                          arrival: searchParams.arrival,
                          departure: searchParams.departure,
                        }}
                      >
                        Zobacz parking
                        <ArrowRight />
                      </Link>
                    </Button>
                  </CardFooter>
                </div>
                {result.assetIds[0] ? (
                  <AssetImage
                    assetId={result.assetIds[0]}
                    alt={result.parkingName}
                    width={640}
                    height={640}
                    className="aspect-auto w-28 shrink-0 self-stretch rounded-none border-y-0 border-r-0 sm:w-48 xl:w-64"
                  />
                ) : null}
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
