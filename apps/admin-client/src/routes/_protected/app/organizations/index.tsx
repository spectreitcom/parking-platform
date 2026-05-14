import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useDebounceCallback } from 'usehooks-ts';
import { EmptyState, PageShell, Toolbar } from '#/components/page-shell';
import { Pagination } from '#/components/pagination.tsx';
import { Button } from '#/components/ui/button.tsx';
import { Input } from '#/components/ui/input.tsx';
import { Spinner } from '#/components/ui/spinner.tsx';
import { getOrganizationsList } from '#/features/organizations/api';
import { CreateOrganizationModal } from '#/features/organizations/components/create-organization-modal.tsx';
import { EditOrganizationModal } from '#/features/organizations/components/edit-organization-modal.tsx';
import { OrganizationsList } from '#/features/organizations/components/organizations-list.tsx';
import { organizationsListInputSchema } from '#/features/organizations/schemas';
import type { OrganizationListItemSchema } from '#/features/organizations/schemas';
import { AlertTriangle, Building2, Plus, Search } from 'lucide-react';

const DEFAULT_LIMIT = 20;
const DEFAULT_PAGE = 1;

export const Route = createFileRoute('/_protected/app/organizations/')({
  component: RouteComponent,
  pendingComponent: () => (
    <div className={'flex h-full w-full items-center justify-center'}>
      <Spinner className={'size-8'} />
    </div>
  ),
  validateSearch: organizationsListInputSchema,
  loaderDeps: ({ search }) => ({
    page: search.page ?? DEFAULT_PAGE,
    limit: search.limit ?? DEFAULT_LIMIT,
    search: search.search,
  }),
  loader: async ({ deps }) => {
    try {
      const response = await getOrganizationsList({
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
        error: 'Failed to fetch organizations.',
      };
    }
  },
});

function RouteComponent() {
  const { items, total, currentPage, limit, error } = Route.useLoaderData();
  const navigate = useNavigate({ from: Route.fullPath });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<
    string | null
  >(null);

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

  const handleEdit = (organization: OrganizationListItemSchema) => {
    setSelectedOrganizationId(organization.id);
    setIsEditModalOpen(true);
  };

  if (error) {
    return (
      <PageShell
        eyebrow="Organizations"
        title="Organizations"
        description="Browse and manage organizations using the parking platform."
      >
        <EmptyState
          icon={<AlertTriangle className="size-5" />}
          title="Could not load organizations"
          description={error}
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Organizations"
      title="Organizations"
      description="Browse organizations, tax identifiers, addresses, and assigned members."
      action={
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className={'mr-2 size-4'} />
          Add Organization
        </Button>
      }
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
          <NoOrganizations onAddClick={() => setIsCreateModalOpen(true)} />
        ) : (
          <div className="space-y-4">
            <OrganizationsList items={items} onEdit={handleEdit} />
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

      <CreateOrganizationModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      <EditOrganizationModal
        open={isEditModalOpen}
        onOpenChange={(open) => {
          setSelectedOrganizationId(open ? selectedOrganizationId : null);
          setIsEditModalOpen(open);
        }}
        organizationId={selectedOrganizationId ?? undefined}
      />
    </PageShell>
  );
}

function NoOrganizations({ onAddClick }: { onAddClick: () => void }) {
  return (
    <EmptyState
      icon={<Building2 className="size-5" />}
      title="No organizations found"
      description="There are no organizations matching the current search criteria."
      action={
        <Button variant={'outline'} className={'mt-6'} onClick={onAddClick}>
          <Plus className={'mr-2 size-4'} />
          Add your first organization
        </Button>
      }
    />
  );
}
