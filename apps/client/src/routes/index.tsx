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
import { MapPin, Search, ShieldCheck, Sparkles } from 'lucide-react';

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
    <main className="app-page">
      <header className="grid gap-6 rounded-3xl border bg-card/80 px-5 py-7 shadow-sm backdrop-blur-sm sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
        <div className="flex max-w-3xl flex-col gap-4">
          <p className="page-eyebrow">Zaparkuj bez stresu</p>
          <h1 className="page-title text-4xl sm:text-5xl">
            Znajdź miejsce, zanim ruszysz w drogę
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Porównaj dostępne parkingi, wybierz dogodny termin i zarezerwuj
            miejsce w kilka chwil.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <HeroBenefit icon={<Search />} text="Szybkie wyszukiwanie" />
          <HeroBenefit icon={<Sparkles />} text="Czytelne ceny" />
          <HeroBenefit icon={<ShieldCheck />} text="Pewna rezerwacja" />
        </div>
      </header>

      <PlaceSearchForm placeTypes={placeTypes.data} />

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="page-eyebrow">Popularne lokalizacje</p>
          <h2 className="text-2xl font-bold tracking-tight">
            Dostępne miejsca
          </h2>
          <p className="text-sm text-muted-foreground">
            Przejrzyj lokalizacje obsługiwane przez platformę.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {places.data.map((place) => (
            <Card
              key={place.placeId}
              className="feature-card gap-4 overflow-hidden"
            >
              <CardHeader className="gap-3">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base leading-6">
                    {place.name}
                  </CardTitle>
                  <Badge variant={place.active ? 'default' : 'secondary'}>
                    {place.active ? 'Aktywne' : 'Nieaktywne'}
                  </Badge>
                </div>
                <CardDescription>{place.placeTypeName}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-sm">
                <p className="flex min-h-10 items-start gap-2 text-muted-foreground">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="line-clamp-2">{place.address}</span>
                </p>
                <div className="grid grid-cols-2 gap-3 border-t pt-4 text-xs text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground">Szerokość</p>
                    <p>{place.latitude.toFixed(5)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Długość</p>
                    <p>{place.longitude.toFixed(5)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}

function HeroBenefit({
  icon,
  text,
}: Readonly<{ icon: React.ReactNode; text: string }>) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-background/70 px-4 py-3 text-sm font-semibold shadow-xs">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary [&_svg]:size-4">
        {icon}
      </span>
      <span>{text}</span>
    </div>
  );
}
