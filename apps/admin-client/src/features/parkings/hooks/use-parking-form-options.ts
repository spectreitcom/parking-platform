'use client';

import { useCallback, useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import type { SearchableOption } from '#/components/searchable-dropdown';
import { getOrganizationsList } from '#/features/organizations/api';
import { getPlacesList } from '#/features/parkings/api';

const SEARCH_DEBOUNCE_MS = 300;
const OPTIONS_LIMIT = 20;

type OptionsState = Readonly<{
  options: SearchableOption[];
  search: string;
  isLoading: boolean;
  error: string | null;
  setSearch: (search: string) => void;
}>;

type RemoteSearchResult = OptionsState &
  Readonly<{
    reset: () => void;
  }>;

export function useParkingFormOptions(open: boolean) {
  const getOrganizationsListFn = useServerFn(getOrganizationsList);
  const getPlacesListFn = useServerFn(getPlacesList);

  const fetchOrganizations = useCallback(
    async (search: string) => {
      const response = await getOrganizationsListFn({
        data: {
          page: 1,
          limit: OPTIONS_LIMIT,
          search: search || undefined,
        },
      });

      return response.data.map((organization) => ({
        id: organization.id,
        label: organization.name,
        description: organization.address,
      }));
    },
    [getOrganizationsListFn],
  );

  const fetchPlaces = useCallback(
    async (search: string) => {
      const response = await getPlacesListFn({
        data: {
          page: 1,
          limit: OPTIONS_LIMIT,
          search: search || undefined,
        },
      });

      return response.data.map((place) => ({
        id: place.id,
        label: place.name,
        description: place.address,
      }));
    },
    [getPlacesListFn],
  );

  const organizations = useRemoteSearch({
    enabled: open,
    fetchOptions: fetchOrganizations,
    fallbackError: 'Failed to load organizations',
  });
  const places = useRemoteSearch({
    enabled: open,
    fetchOptions: fetchPlaces,
    fallbackError: 'Failed to load places',
  });

  const reset = useCallback(() => {
    organizations.reset();
    places.reset();
  }, [organizations.reset, places.reset]);

  return {
    organizations: toOptionsState(organizations),
    places: toOptionsState(places),
    reset,
  };
}

function useRemoteSearch({
  enabled,
  fetchOptions,
  fallbackError,
}: Readonly<{
  enabled: boolean;
  fetchOptions: (search: string) => Promise<SearchableOption[]>;
  fallbackError: string;
}>): RemoteSearchResult {
  const [options, setOptions] = useState<SearchableOption[]>([]);
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const timeoutId = window.setTimeout(() => {
      setSearchQuery(search);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [enabled, search]);

  useEffect(() => {
    if (!enabled) return;

    let ignoreResponse = false;

    async function loadOptions() {
      setIsLoading(true);
      setError(null);

      try {
        const fetchedOptions = await fetchOptions(searchQuery);

        if (!ignoreResponse) {
          setOptions(fetchedOptions);
        }
      } catch (caughtError) {
        if (!ignoreResponse) {
          setOptions([]);
          setError(
            caughtError instanceof Error ? caughtError.message : fallbackError,
          );
        }
      } finally {
        if (!ignoreResponse) {
          setIsLoading(false);
        }
      }
    }

    void loadOptions();

    return () => {
      ignoreResponse = true;
    };
  }, [enabled, fallbackError, fetchOptions, searchQuery]);

  const reset = useCallback(() => {
    setOptions([]);
    setSearch('');
    setSearchQuery('');
    setIsLoading(false);
    setError(null);
  }, []);

  return { options, search, isLoading, error, setSearch, reset };
}

function toOptionsState({
  options,
  search,
  isLoading,
  error,
  setSearch,
}: RemoteSearchResult): OptionsState {
  return { options, search, isLoading, error, setSearch };
}
