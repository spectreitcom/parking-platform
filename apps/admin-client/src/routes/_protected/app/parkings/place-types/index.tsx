import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Spinner } from '#/components/ui/spinner.tsx';
import { parkingListBaseInputSchema } from '#/features/parkings/schemas';
import { getPlaceTypes } from '#/features/parkings/api';
import { useDebounceCallback } from 'usehooks-ts';
import { Input } from '#/components/ui/input.tsx';
import { Pagination } from '#/components/pagination.tsx';
import { PlaceTypesList } from '#/features/parkings/components/place-types-list.tsx';

const DEFAULT_LIMIT = 20;
const DEFAULT_PAGE = 1;

export const Route = createFileRoute('/_protected/app/parkings/place-types/')({
  component: RouteComponent,
  pendingComponent: () => (
    <div className={'flex h-full w-full items-center justify-center'}>
      <Spinner className={'size-8'} />
    </div>
  ),
  validateSearch: parkingListBaseInputSchema,
  loaderDeps: ({ search }) => ({
    page: search.page ?? DEFAULT_PAGE,
    limit: search.limit ?? DEFAULT_LIMIT,
    search: search.search,
  }),
  loader: async ({ deps }) => {
    try {
      const response = await getPlaceTypes({
        data: {
          page: deps.page,
          search: deps.search,
          limit: deps.limit,
        },
      });

      return {
        items: response.data,
        total: response.total,
        currentPage: response.currentPage,
        limit: deps.limit,
        error: null,
      };
    } catch (error) {
      return {
        items: [],
        total: 0,
        currentPage: 1,
        limit: deps.limit,
        error: 'Failed to fetch place types.',
      };
    }
  },
});

function RouteComponent() {
  const { items, total, currentPage, limit, error } = Route.useLoaderData();
  const navigate = useNavigate({ from: Route.fullPath });

  const handlePageChange = async (page: number) => {
    await navigate({
      search: (prev) => ({
        ...prev,
        page,
      }),
    });
  };

  const handleSearch = async (search: string) => {
    await navigate({
      search: (prev) => ({
        ...prev,
        search,
        page: 1,
      }),
    });
  };

  const debouncedSearch = useDebounceCallback(handleSearch, 500);

  if (error) {
    return (
      <div className={'mt-8'}>
        <h1 className={'text-2xl font-bold'}>Place Types</h1>
        <p className={'mt-4 text-destructive'}>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className={'text-2xl font-bold'}>Place Types</h1>
      <div className={'mt-8'}>
        <div>
          <Input
            placeholder={'Search'}
            onChange={(e) => debouncedSearch(e.target.value)}
          />
        </div>
        {items.length === 0 ? (
          <NoPlaceTypes />
        ) : (
          <div>
            <div className={'mt-4 flex justify-end'}>
              <Pagination
                total={total}
                page={currentPage}
                pageSize={limit}
                onPageChange={handlePageChange}
              />
            </div>
            <PlaceTypesList items={items} />
            <div className={'mt-4 flex justify-end'}>
              <Pagination
                total={total}
                page={currentPage}
                pageSize={limit}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NoPlaceTypes() {
  return (
    <div
      className={
        'flex h-full w-full flex-col items-center justify-center py-20'
      }
    >
      <h2 className={'text-xl font-semibold'}>No place types found</h2>
      <p className={'text-muted-foreground'}>
        There are no place types in the system matching the criteria.
      </p>
    </div>
  );
}
