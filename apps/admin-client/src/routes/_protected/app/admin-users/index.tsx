import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { getAdminsList } from '#/features/admins/api';
import { adminListInputSchema } from '#/features/admins/schemas';
import { Spinner } from '#/components/ui/spinner';
import { AdminUsersList } from '#/features/admins/components/admin-users-list.tsx';
import { Pagination } from '#/components/pagination.tsx';
import { Input } from '#/components/ui/input.tsx';
import { useDebounceCallback } from 'usehooks-ts';
import { EmptyState, PageShell, Toolbar } from '#/components/page-shell';
import { AlertTriangle, Search, ShieldCheck } from 'lucide-react';

const DEFAULT_LIMIT = 20;
const DEFAULT_PAGE = 1;

export const Route = createFileRoute('/_protected/app/admin-users/')({
  component: RouteComponent,
  pendingComponent: () => (
    <div className={'flex h-full w-full items-center justify-center'}>
      <Spinner className={'size-8'} />
    </div>
  ),
  validateSearch: adminListInputSchema,
  loaderDeps: ({ search }) => ({
    page: search.page ?? DEFAULT_PAGE,
    limit: search.limit ?? DEFAULT_LIMIT,
    search: search.search,
  }),
  loader: async ({ deps }) => {
    try {
      const response = await getAdminsList({
        data: {
          page: deps.page,
          search: deps.search,
          limit: deps.limit,
        },
      });

      return {
        adminUsers: response.data,
        total: response.total,
        currentPage: response.currentPage,
        limit: deps.limit,
        error: null,
      };
    } catch (error) {
      return {
        adminUsers: [],
        total: 0,
        currentPage: 1,
        limit: deps.limit,
        error: 'Failed to fetch admin users.',
      };
    }
  },
});

function RouteComponent() {
  const { adminUsers, total, currentPage, limit, error } =
    Route.useLoaderData();
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
      <PageShell
        eyebrow="Access"
        title="Admin Users"
        description="Review administrator accounts and their account status."
      >
        <EmptyState
          icon={<AlertTriangle className="size-5" />}
          title="Could not load administrators"
          description={error}
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Access"
      title="Admin Users"
      description="Review administrator accounts, email identities, and lifecycle status."
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
              placeholder={'Search'}
              className="pl-9"
              onChange={(e) => debouncedSearch(e.target.value)}
            />
          </div>
        </Toolbar>
        {adminUsers.length === 0 ? (
          <NoAdminUsers />
        ) : (
          <div className="space-y-4">
            <AdminUsersList items={adminUsers} />
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

function NoAdminUsers() {
  return (
    <EmptyState
      icon={<ShieldCheck className="size-5" />}
      title="No administrators found"
      description="There are no administrator accounts matching the current search criteria."
    />
  );
}
