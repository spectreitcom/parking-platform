import {
  createFileRoute,
  useNavigate,
  useRouter,
} from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useState } from 'react';
import { toast } from 'sonner';
import { useDebounceCallback } from 'usehooks-ts';
import { ConfirmDialog } from '#/components/confirm-dialog.tsx';
import { EmptyState, PageShell, Toolbar } from '#/components/page-shell';
import { Pagination } from '#/components/pagination.tsx';
import { Button } from '#/components/ui/button.tsx';
import { Input } from '#/components/ui/input.tsx';
import { Spinner } from '#/components/ui/spinner.tsx';
import {
  deleteParkingFeature,
  getParkingFeatures,
} from '#/features/parkings/api';
import { CreateParkingFeatureModal } from '#/features/parkings/components/create-parking-feature-modal.tsx';
import { EditParkingFeatureModal } from '#/features/parkings/components/edit-parking-feature-modal.tsx';
import { ParkingFeaturesList } from '#/features/parkings/components/parking-features-list.tsx';
import { parkingListBaseInputSchema } from '#/features/parkings/schemas';
import type { ParkingFeaturesListItemSchema } from '#/features/parkings/schemas';
import { AlertTriangle, Plus, Search, Sparkles } from 'lucide-react';

const DEFAULT_LIMIT = 20;
const DEFAULT_PAGE = 1;

export const Route = createFileRoute(
  '/_protected/app/parkings/parking-features/',
)({
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
      const response = await getParkingFeatures({
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
        error: 'Failed to fetch parking features.',
      };
    }
  },
});

function RouteComponent() {
  const { items, total, currentPage, limit, error } = Route.useLoaderData();
  const navigate = useNavigate({ from: Route.fullPath });
  const router = useRouter();
  const deleteParkingFeatureFn = useServerFn(deleteParkingFeature);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedParkingFeature, setSelectedParkingFeature] =
    useState<ParkingFeaturesListItemSchema | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleEdit = (parkingFeature: ParkingFeaturesListItemSchema) => {
    setSelectedParkingFeature(parkingFeature);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (parkingFeature: ParkingFeaturesListItemSchema) => {
    setSelectedParkingFeature(parkingFeature);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedParkingFeature) return;

    setIsDeleting(true);
    try {
      await deleteParkingFeatureFn({
        data: {
          parkingFeatureId: selectedParkingFeature.id,
          version: selectedParkingFeature.version,
        },
      });
      toast.success('Parking feature deleted successfully');
      setIsDeleteDialogOpen(false);
      await router.invalidate();
    } catch (err) {
      toast.error('Failed to delete parking feature');
    } finally {
      setIsDeleting(false);
    }
  };

  if (error) {
    return (
      <PageShell
        eyebrow="Parking"
        title="Parking Features"
        description="Create and maintain the feature catalog used by parking configurations."
      >
        <EmptyState
          icon={<AlertTriangle className="size-5" />}
          title="Could not load parking features"
          description={error}
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Parking"
      title="Parking Features"
      description="Maintain reusable feature definitions and level labels for parking configuration."
      action={
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className={'mr-2 size-4'} />
          Add Parking Feature
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
              placeholder={'Search by name...'}
              className="pl-9"
              onChange={(e) => debouncedSearch(e.target.value)}
            />
          </div>
        </Toolbar>
        {items.length === 0 ? (
          <NoParkingFeatures onAddClick={() => setIsCreateModalOpen(true)} />
        ) : (
          <div className="space-y-4">
            <ParkingFeaturesList
              items={items}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
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

      <CreateParkingFeatureModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      <EditParkingFeatureModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        parkingFeatureId={selectedParkingFeature?.id}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title={'Delete Parking Feature'}
        description={`Are you sure you want to delete "${selectedParkingFeature?.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        variant={'destructive'}
        isLoading={isDeleting}
        confirmText={'Delete'}
      />
    </PageShell>
  );
}

function NoParkingFeatures({ onAddClick }: { onAddClick: () => void }) {
  return (
    <EmptyState
      icon={<Sparkles className="size-5" />}
      title="No parking features found"
      description="There are no parking features matching the current search criteria."
      action={
        <Button variant={'outline'} className={'mt-6'} onClick={onAddClick}>
          <Plus className={'mr-2 size-4'} />
          Add your first parking feature
        </Button>
      }
    />
  );
}
