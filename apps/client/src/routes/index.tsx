import { createFileRoute } from '@tanstack/react-router';
import { Badge } from '#/components/ui/badge.tsx';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card.tsx';
import { getPlaces } from '#/features/places/api';
import { PlaceSearchForm } from '#/features/search/components/place-search-form.tsx';
import { getPlaceTypes } from '#/features/place-types/api';

export const Route = createFileRoute('/')({
  component: Home,
  loader: async () => {
    const [placeTypes, places] = await Promise.all([
      getPlaceTypes({ data: { limit: 100 } }),
      getPlaces({ data: { limit: 12 } }),
    ]);

    return { placeTypes, places };
  },
});

function Home() {
  const { placeTypes, places } = Route.useLoaderData();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 lg:px-8">
      <header className="flex max-w-3xl flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground">
          Parking Platform
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Find available parking
        </h1>
        <p className="text-muted-foreground">
          Pick a place type and reservation time to see matching parking
          options.
        </p>
      </header>

      <PlaceSearchForm placeTypes={placeTypes.data} />

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold tracking-tight">
            Available places
          </h2>
          <p className="text-sm text-muted-foreground">
            Browse places before starting a search.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {places.data.map((place) => (
            <Card key={place.placeId} className="gap-4 overflow-hidden">
              <CardHeader className="gap-3">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base leading-6">
                    {place.name}
                  </CardTitle>
                  <Badge variant={place.active ? 'default' : 'secondary'}>
                    {place.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <CardDescription>{place.placeTypeName}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-sm">
                <p className="line-clamp-2 min-h-10 text-muted-foreground">
                  {place.address}
                </p>
                <div className="grid grid-cols-2 gap-3 border-t pt-4 text-xs text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground">Latitude</p>
                    <p>{place.latitude.toFixed(5)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Longitude</p>
                    <p>{place.longitude.toFixed(5)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
