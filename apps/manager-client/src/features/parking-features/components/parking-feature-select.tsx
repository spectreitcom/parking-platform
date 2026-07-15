'use client';

import { useEffect, useMemo, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { CheckIcon, ChevronsUpDownIcon, SearchIcon, XIcon } from 'lucide-react';
import type { z } from 'zod';

import { Button } from '#/components/ui/button.tsx';
import { Input } from '#/components/ui/input.tsx';
import { Spinner } from '#/components/ui/spinner.tsx';
import { getParkingFeatures } from '#/features/parking-features/api';
import type { parkingFeatureListItemSchema } from '#/features/parking-features/schemas';
import { cn } from '#/lib/utils.ts';

const PARKING_FEATURES_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 300;

export type ParkingFeatureOption = Pick<
  z.infer<typeof parkingFeatureListItemSchema>,
  'id' | 'name'
>;

type ParkingFeatureLevel = 'PARKING' | 'PARKING_SPOT';

type ParkingFeatureSelectProps = Readonly<{
  active: boolean;
  level: ParkingFeatureLevel;
  value: Array<string>;
  initialOptions?: ReadonlyArray<ParkingFeatureOption>;
  onChange: (value: Array<string>) => void;
}>;

export function ParkingFeatureSelect({
  active,
  level,
  value,
  initialOptions = [],
  onChange,
}: ParkingFeatureSelectProps) {
  const getParkingFeaturesFn = useServerFn(getParkingFeatures);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<Array<ParkingFeatureOption>>([]);
  const [knownOptions, setKnownOptions] = useState<
    Record<string, ParkingFeatureOption>
  >(() => createOptionsMap(initialOptions));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedOptions = useMemo(
    () =>
      value
        .map((featureId) => knownOptions[featureId])
        .filter((feature): feature is ParkingFeatureOption => Boolean(feature)),
    [knownOptions, value],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    if (!active) {
      return;
    }

    let isActive = true;

    async function fetchOptions() {
      setLoading(true);
      setError(null);

      try {
        const response = await getParkingFeaturesFn({
          data: {
            page: 1,
            limit: PARKING_FEATURES_LIMIT,
            search: debouncedSearch,
            levels: [level],
          },
        });

        if (isActive) {
          setOptions(response.data);
          setKnownOptions((currentOptions) => ({
            ...currentOptions,
            ...createOptionsMap(response.data),
          }));
        }
      } catch {
        if (isActive) {
          setOptions([]);
          setError('Failed to load parking features.');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void fetchOptions();

    return () => {
      isActive = false;
    };
  }, [active, debouncedSearch, getParkingFeaturesFn, level]);

  function toggleOption(option: ParkingFeatureOption) {
    setKnownOptions((currentOptions) => ({
      ...currentOptions,
      [option.id]: option,
    }));

    onChange(
      value.includes(option.id)
        ? value.filter((featureId) => featureId !== option.id)
        : [...value, option.id],
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          className="h-auto min-h-9 w-full justify-between gap-3 px-3 py-2 text-left font-normal"
          aria-expanded={open}
          aria-haspopup="listbox"
          onClick={() => setOpen((currentOpen) => !currentOpen)}
        >
          <span
            className={cn(
              'min-w-0 flex-1 truncate text-sm',
              selectedOptions.length === 0 && 'text-muted-foreground',
            )}
          >
            {selectedOptions.length > 0
              ? selectedOptions.map((feature) => feature.name).join(', ')
              : 'Select parking features'}
          </span>
          <ChevronsUpDownIcon
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground"
          />
        </Button>

        {open && (
          <div className="absolute z-50 mt-2 w-full rounded-md border bg-popover p-2 text-popover-foreground shadow-md">
            <div className="relative">
              <SearchIcon
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search parking features"
                className="pl-9"
                autoFocus
              />
            </div>

            <div className="mt-2 max-h-60 overflow-y-auto" role="listbox">
              {loading ? (
                <div className="flex items-center gap-2 px-2 py-3 text-sm text-muted-foreground">
                  <Spinner className="size-4" />
                  Loading features
                </div>
              ) : error ? (
                <p className="px-2 py-3 text-sm text-destructive">{error}</p>
              ) : options.length > 0 ? (
                <div className="space-y-1">
                  {options.map((option) => {
                    const selected = value.includes(option.id);

                    return (
                      <button
                        key={option.id}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm outline-hidden hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground"
                        onClick={() => toggleOption(option)}
                      >
                        <span
                          className={cn(
                            'flex size-4 items-center justify-center rounded-sm border',
                            selected &&
                              'border-primary bg-primary text-primary-foreground',
                          )}
                        >
                          {selected && (
                            <CheckIcon aria-hidden="true" className="size-3" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1 truncate">
                          {option.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="px-2 py-3 text-sm text-muted-foreground">
                  No features found.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className="inline-flex max-w-full items-center gap-1 rounded-md border bg-muted px-2 py-1 text-xs font-medium"
              onClick={() =>
                onChange(value.filter((featureId) => featureId !== option.id))
              }
            >
              <span className="truncate">{option.name}</span>
              <XIcon
                aria-hidden="true"
                className="size-3 shrink-0 text-muted-foreground"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function createOptionsMap(options: ReadonlyArray<ParkingFeatureOption>) {
  return Object.fromEntries(options.map((option) => [option.id, option]));
}
