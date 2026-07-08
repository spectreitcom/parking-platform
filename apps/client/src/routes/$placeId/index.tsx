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
    <div className={'flex h-full w-full items-center justify-center'}>
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
        error: 'Something went wrong',
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
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10 lg:px-8">
        <Alert variant="destructive">
          <AlertTitle>Search failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button asChild variant="outline" className="w-fit">
          <Link to="/">Back to search</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:px-8">
      <header className="flex flex-col gap-3">
        <Button asChild variant="link" className="h-auto w-fit px-0">
          <Link to="/">Back to search</Link>
        </Button>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">
            Search results
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            {place?.name ?? 'Selected place'}
          </h1>
          {place ? (
            <p className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-4" />
              {place.address}
            </p>
          ) : null}
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="rounded-lg border bg-card p-4 lg:sticky lg:top-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-semibold">
              <ListFilter className="size-4" />
              Filters
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
                Clear
              </Button>
            ) : null}
          </div>
          <fieldset className="grid gap-3">
            <legend className="mb-3 text-sm font-medium text-muted-foreground">
              Features
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
                No filters available
              </p>
            ) : null}
          </fieldset>
        </aside>

        {searchResults.length === 0 ? (
          <Alert>
            <AlertTitle>No results found</AlertTitle>
            <AlertDescription>
              Try changing the selected filters or reservation time.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {searchResults.map((result) => (
              <Card key={result.parkingId} className="gap-4 overflow-hidden">
                {result.assetIds[0] ? (
                  <AssetImage
                    assetId={result.assetIds[0]}
                    alt={result.parkingName}
                    width={640}
                    height={360}
                    className="rounded-none border-0"
                  />
                ) : null}
                <CardHeader className="gap-3">
                  <div className="flex items-start justify-between gap-3">
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
                        No listed features
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border px-3 py-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Total price
                    </p>
                    <p className="text-xl font-semibold">
                      {result.totalPricePLN === null
                        ? 'Price unavailable'
                        : `${result.totalPricePLN.toFixed(2)} PLN`}
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full" variant={'ghost'}>
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
                      View parking
                      <ArrowRight />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
