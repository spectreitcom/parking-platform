import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { AlertTriangle, ClipboardList, Search } from 'lucide-react';
import { useDebounceCallback } from 'usehooks-ts';
import { EmptyState, PageShell, Toolbar } from '#/components/page-shell';
import { Pagination } from '#/components/pagination.tsx';
import { Input } from '#/components/ui/input.tsx';
import { Spinner } from '#/components/ui/spinner.tsx';
import { reservationsList } from '#/features/reservations/api';
import { ReservationsList } from '#/features/reservations/components/reservations-list.tsx';
import { reservationsListInputSchema } from '#/features/reservations/schemas';

const DEFAULT_LIMIT = 20;
const DEFAULT_PAGE = 1;

export const Route = createFileRoute('/_protected/app/reservations/')({
  component: RouteComponent,
  pendingComponent: () => (
    <div className="flex h-full w-full items-center justify-center">
      <Spinner className="size-8" />
    </div>
  ),
  validateSearch: reservationsListInputSchema,
  loaderDeps: ({ search }) => ({
    page: search.page ?? DEFAULT_PAGE,
    limit: search.limit ?? DEFAULT_LIMIT,
    search: search.search,
  }),
  loader: async ({ deps }) => {
    try {
      const response = await reservationsList({
        data: {
          page: deps.page,
          limit: deps.limit,
          search: deps.search,
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
        error: 'Failed to fetch reservations.',
      };
    }
  },
});

function RouteComponent() {
  const { items, total, currentPage, limit, error } = Route.useLoaderData();
  const navigate = useNavigate({ from: Route.fullPath });

  const handlePageChange = async (page: number) => {
    await navigate({
      search: (previousSearch) => ({
        ...previousSearch,
        page,
      }),
    });
  };

  const handleSearch = async (search: string) => {
    await navigate({
      search: (previousSearch) => ({
        ...previousSearch,
        search,
        page: 1,
      }),
    });
  };

  const debouncedSearch = useDebounceCallback(handleSearch, 500);

  if (error) {
    return (
      <PageShell
        eyebrow="Operations"
        title="Reservations"
        description="Browse platform reservations, customers, and payment status."
      >
        <EmptyState
          icon={<AlertTriangle className="size-5" />}
          title="Could not load reservations"
          description={error}
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Operations"
      title="Reservations"
      description="Browse platform reservations, vehicle registrations, customers, and payment status."
    >
      <div className="space-y-4">
        <Toolbar
          aside={
            <Pagination
              total={total}
              page={currentPage}
              pageSize={limit}
              onPageChange={handlePageChange}
            />
          }
        >
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search reservations"
              className="pl-9"
              onChange={(event) => debouncedSearch(event.target.value)}
            />
          </div>
        </Toolbar>
        {items.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="size-5" />}
            title="No reservations found"
            description="There are no reservations matching the current search criteria."
          />
        ) : (
          <div className="space-y-4">
            <ReservationsList items={items} />
            <div className="flex justify-end">
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
    </PageShell>
  );
}
