import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { getAdminsList } from '#/features/admins/api';
import { adminListInputSchema } from '#/features/admins/schemas';
import { Spinner } from '#/components/ui/spinner';
import { AdminUsersList } from '#/features/admins/components/admin-users-list.tsx';
import { Pagination } from '#/components/pagination.tsx';
import { Input } from '#/components/ui/input.tsx';
import { useDebounceCallback } from 'usehooks-ts';

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
        limit: 0,
        error: 'Failed to fetch admin users',
      };
    }
  },
});

function RouteComponent() {
  const { adminUsers, total, currentPage, limit } = Route.useLoaderData();
  const navigate = useNavigate();

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

  return (
    <div>
      <h1 className={'text-2xl'}>Admin Users</h1>
      <div className={'mt-8'}>
        <div>
          <Input
            placeholder={'Search'}
            onChange={(e) => debouncedSearch(e.target.value)}
          />
        </div>
        {adminUsers.length === 0 ? (
          <NoAdminUsers />
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
            <AdminUsersList items={adminUsers} />
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

function NoAdminUsers() {
  return (
    <div
      className={
        'flex h-full w-full flex-col items-center justify-center py-20'
      }
    >
      <h2 className={'text-xl font-semibold'}>No admin users found</h2>
      <p className={'text-muted-foreground'}>
        There are no administrator users in the system.
      </p>
    </div>
  );
}
