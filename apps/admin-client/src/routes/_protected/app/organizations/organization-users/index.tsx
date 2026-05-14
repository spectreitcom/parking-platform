import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useDebounceCallback } from 'usehooks-ts';
import { EmptyState, PageShell, Toolbar } from '#/components/page-shell';
import { Pagination } from '#/components/pagination.tsx';
import { Input } from '#/components/ui/input.tsx';
import { Spinner } from '#/components/ui/spinner.tsx';
import { getOrganizationUsers } from '#/features/organization-users/api';
import { OrganizationUsersList } from '#/features/organization-users/components/organization-users-list.tsx';
import { organizationUsersListInputSchema } from '#/features/organization-users/schemas';
import { AlertTriangle, Search, Users } from 'lucide-react';

const DEFAULT_LIMIT = 20;
const DEFAULT_PAGE = 1;

export const Route = createFileRoute(
  '/_protected/app/organizations/organization-users/',
)({
  component: RouteComponent,
  pendingComponent: () => (
    <div className={'flex h-full w-full items-center justify-center'}>
      <Spinner className={'size-8'} />
    </div>
  ),
  validateSearch: organizationUsersListInputSchema,
  loaderDeps: ({ search }) => ({
    page: search.page ?? DEFAULT_PAGE,
    limit: search.limit ?? DEFAULT_LIMIT,
    search: search.search,
  }),
  loader: async ({ deps }) => {
    try {
      const response = await getOrganizationUsers({
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
        error: 'Failed to fetch organization users.',
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
      <PageShell
        eyebrow="Organizations"
        title="Organization Users"
        description="Review people who can be assigned to organizations."
      >
        <EmptyState
          icon={<AlertTriangle className="size-5" />}
          title="Could not load organization users"
          description={error}
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Organizations"
      title="Organization Users"
      description="Review organization user identities, email addresses, and lifecycle status."
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
              placeholder={'Search...'}
              className="pl-9"
              onChange={(e) => debouncedSearch(e.target.value)}
            />
          </div>
        </Toolbar>
        {items.length === 0 ? (
          <NoOrganizationUsers />
        ) : (
          <div className="space-y-4">
            <OrganizationUsersList items={items} />
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

function NoOrganizationUsers() {
  return (
    <EmptyState
      icon={<Users className="size-5" />}
      title="No organization users found"
      description="There are no organization users matching the current search criteria."
    />
  );
}
