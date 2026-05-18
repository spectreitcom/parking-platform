import {
  createFileRoute,
  useNavigate,
  useRouter,
} from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '#/components/confirm-dialog.tsx';
import { Spinner } from '#/components/ui/spinner.tsx';
import type { ParkingListItemSchema } from '#/features/parkings/schemas';
import { parkingListBaseInputSchema } from '#/features/parkings/schemas';
import {
  activateParking,
  deactivateParking,
  getParkingList,
} from '#/features/parkings/api';
import { useDebounceCallback } from 'usehooks-ts';
import { Input } from '#/components/ui/input.tsx';
import { Button } from '#/components/ui/button.tsx';
import { Pagination } from '#/components/pagination.tsx';
import { ParkingsList } from '#/features/parkings/components/parkings-list.tsx';
import { CreateParkingModal } from '#/features/parkings/components/create-parking-modal.tsx';
import { EmptyState, PageShell, Toolbar } from '#/components/page-shell';
import { AlertTriangle, CarFront, Plus, Search } from 'lucide-react';

const DEFAULT_LIMIT = 20;
const DEFAULT_PAGE = 1;

export const Route = createFileRoute('/_protected/app/parkings/')({
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
      const response = await getParkingList({
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
        error: 'Failed to fetch parking list.',
      };
    }
  },
});

function RouteComponent() {
  const { items, total, currentPage, limit, error } = Route.useLoaderData();
  const navigate = useNavigate({ from: Route.fullPath });
  const router = useRouter();
  const activateParkingFn = useServerFn(activateParking);
  const deactivateParkingFn = useServerFn(deactivateParking);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedParking, setSelectedParking] =
    useState<ParkingListItemSchema | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

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

  const handleStatusChangeClick = (parking: ParkingListItemSchema) => {
    setSelectedParking(parking);
    setIsStatusDialogOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedParking) return;

    setIsStatusUpdating(true);
    try {
      const payload = {
        parkingId: selectedParking.id,
        version: selectedParking.version,
      };

      if (selectedParking.active) {
        await deactivateParkingFn({ data: payload });
        toast.success('Parking deactivated successfully');
      } else {
        await activateParkingFn({ data: payload });
        toast.success('Parking activated successfully');
      }

      setIsStatusDialogOpen(false);
      setSelectedParking(null);
      await router.invalidate();
    } catch (err) {
      toast.error(
        selectedParking.active
          ? 'Failed to deactivate parking'
          : 'Failed to activate parking',
      );
    } finally {
      setIsStatusUpdating(false);
      await router.invalidate();
    }
  };

  if (error) {
    return (
      <PageShell
        eyebrow="Parking"
        title="Parkings"
        description="Browse and monitor parking locations connected to organizations and places."
      >
        <EmptyState
          icon={<AlertTriangle className="size-5" />}
          title="Could not load parkings"
          description={error}
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Parking"
      title="Parkings"
      description="Browse parking locations, their assigned organizations, places, and current operational status."
    >
      <div className="space-y-4">
        <Toolbar
          aside={
            <div className="flex items-center gap-2">
              <Pagination
                total={total}
                page={currentPage}
                pageSize={limit}
                onPageChange={handlePageChange}
              />
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="size-4" />
                Add Parking
              </Button>
            </div>
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
        {items.length === 0 ? (
          <NoParkings onAddClick={() => setIsCreateModalOpen(true)} />
        ) : (
          <div className="space-y-4">
            <ParkingsList
              items={items}
              onStatusChange={handleStatusChangeClick}
            />
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
      <CreateParkingModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
      <ConfirmDialog
        open={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
        title={`${selectedParking?.active ? 'Deactivate' : 'Activate'} Parking`}
        description={`Are you sure you want to ${selectedParking?.active ? 'deactivate' : 'activate'} "${selectedParking?.name}"?`}
        onConfirm={handleConfirmStatusChange}
        variant={selectedParking?.active ? 'destructive' : 'default'}
        isLoading={isStatusUpdating}
        confirmText={selectedParking?.active ? 'Deactivate' : 'Activate'}
      />
    </PageShell>
  );
}

function NoParkings({ onAddClick }: { onAddClick: () => void }) {
  return (
    <EmptyState
      icon={<CarFront className="size-5" />}
      title="No parkings found"
      description="There are no parking locations matching the current search criteria."
      action={
        <Button onClick={onAddClick}>
          <Plus className="size-4" />
          Add Parking
        </Button>
      }
    />
  );
}
