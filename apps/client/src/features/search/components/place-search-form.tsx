import { useEffect, useMemo, useState, useTransition } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Loader2, Search } from 'lucide-react';
import type { z } from 'zod';

import { Alert, AlertDescription } from '#/components/ui/alert.tsx';
import { Button } from '#/components/ui/button.tsx';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card.tsx';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '#/components/ui/field.tsx';
import { Input } from '#/components/ui/input.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select.tsx';
import { getPlaces } from '#/features/places/api';
import type { placesListItemSchema } from '#/features/places/schemas';
import type { placeTypeSchema } from '#/features/place-types/schemas';

type PlaceType = z.infer<typeof placeTypeSchema>;
type Place = z.infer<typeof placesListItemSchema>;

type PlaceSearchFormProps = {
  placeTypes: Array<PlaceType>;
};

function toTimestampSeconds(value: string) {
  return Math.floor(new Date(value).getTime() / 1000);
}

function getInitialDateTimeValue(offsetHours: number) {
  const date = new Date();
  date.setHours(date.getHours() + offsetHours, 0, 0, 0);

  const timezoneOffset = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

export function PlaceSearchForm({ placeTypes }: PlaceSearchFormProps) {
  const navigate = useNavigate();
  const [isPending, startTransition] = useTransition();
  const [placeTypeId, setPlaceTypeId] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [places, setPlaces] = useState<Array<Place>>([]);
  const [placesError, setPlacesError] = useState('');
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [arrival, setArrival] = useState(() => getInitialDateTimeValue(1));
  const [departure, setDeparture] = useState(() => getInitialDateTimeValue(3));
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!placeTypeId) {
      setPlaces([]);
      setPlaceId('');
      return;
    }

    let isCurrent = true;

    setIsLoadingPlaces(true);
    setPlacesError('');
    setPlaceId('');

    getPlaces({ data: { placeTypeId, limit: 100 } })
      .then((response) => {
        if (isCurrent) {
          setPlaces(response.data);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setPlaces([]);
          setPlacesError('Could not load places for this place type.');
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoadingPlaces(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [placeTypeId]);

  const selectedPlace = useMemo(
    () => places.find((place) => place.placeId === placeId),
    [placeId, places],
  );

  const canSubmit =
    Boolean(placeTypeId) &&
    Boolean(placeId) &&
    Boolean(arrival) &&
    Boolean(departure) &&
    !isLoadingPlaces &&
    !isPending;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');

    const arrivalTimestamp = toTimestampSeconds(arrival);
    const departureTimestamp = toTimestampSeconds(departure);

    if (!Number.isFinite(arrivalTimestamp) || !Number.isFinite(departureTimestamp)) {
      setFormError('Choose a valid arrival and departure date.');
      return;
    }

    if (departureTimestamp <= arrivalTimestamp) {
      setFormError('Departure must be later than arrival.');
      return;
    }

    if (!placeId) {
      setFormError('Choose a place before searching.');
      return;
    }

    startTransition(() => {
      void navigate({
        to: '/$placeId',
        params: { placeId },
        search: {
          arrival: arrivalTimestamp,
          departure: departureTimestamp,
        },
      });
    });
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Search parking</CardTitle>
        <CardDescription>
          Choose a place type, place, and reservation window.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <FieldGroup className="grid gap-5 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="place-type">Place type</FieldLabel>
              <Select value={placeTypeId} onValueChange={setPlaceTypeId}>
                <SelectTrigger id="place-type" className="w-full">
                  <SelectValue placeholder="Select a place type" />
                </SelectTrigger>
                <SelectContent>
                  {placeTypes.map((placeType) => (
                    <SelectItem key={placeType.id} value={placeType.id}>
                      {placeType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="place">Place</FieldLabel>
              <Select
                value={placeId}
                onValueChange={setPlaceId}
                disabled={!placeTypeId || isLoadingPlaces || places.length === 0}
              >
                <SelectTrigger id="place" className="w-full">
                  <SelectValue
                    placeholder={
                      isLoadingPlaces ? 'Loading places...' : 'Select a place'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {places.map((place) => (
                    <SelectItem key={place.placeId} value={place.placeId}>
                      {place.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPlace ? (
                <FieldDescription>{selectedPlace.address}</FieldDescription>
              ) : null}
            </Field>

            <Field>
              <FieldLabel htmlFor="arrival">Arrival</FieldLabel>
              <Input
                id="arrival"
                type="datetime-local"
                value={arrival}
                onChange={(event) => setArrival(event.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="departure">Departure</FieldLabel>
              <Input
                id="departure"
                type="datetime-local"
                value={departure}
                onChange={(event) => setDeparture(event.target.value)}
              />
            </Field>
          </FieldGroup>

          {placesError ? (
            <Alert variant="destructive">
              <AlertDescription>{placesError}</AlertDescription>
            </Alert>
          ) : null}

          {formError ? (
            <Alert variant="destructive">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={!canSubmit}>
              {isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Search />
              )}
              Search
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
