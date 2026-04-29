import {
  createFileRoute,
  useNavigate,
  useRouter,
} from '@tanstack/react-router';
import { Spinner } from '#/components/ui/spinner.tsx';
import { parkingListBaseInputSchema } from '#/features/parkings/schemas';
import { deletePlaceType, getPlaceTypes } from '#/features/parkings/api';
import { useDebounceCallback } from 'usehooks-ts';
import { Input } from '#/components/ui/input.tsx';
import { Pagination } from '#/components/pagination.tsx';
import { PlaceTypesList } from '#/features/parkings/components/place-types-list.tsx';
import { Button } from '#/components/ui/button.tsx';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { CreatePlaceTypeModal } from '#/features/parkings/components/create-place-type-modal.tsx';
import { EditPlaceTypeModal } from '#/features/parkings/components/edit-place-type-modal.tsx';
import { ConfirmDialog } from '#/components/confirm-dialog.tsx';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import type { PlaceTypesListItemSchema } from '#/features/parkings/schemas';

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
  const router = useRouter();
  const deletePlaceTypeFn = useServerFn(deletePlaceType);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPlaceType, setSelectedPlaceType] =
    useState<PlaceTypesListItemSchema | null>(null);
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

  const handleEdit = (placeType: PlaceTypesListItemSchema) => {
    setSelectedPlaceType(placeType);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (placeType: PlaceTypesListItemSchema) => {
    setSelectedPlaceType(placeType);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPlaceType) return;

    setIsDeleting(true);
    try {
      await deletePlaceTypeFn({
        data: {
          placeTypeId: selectedPlaceType.id,
          version: selectedPlaceType.version,
        },
      });
      toast.success('Place type deleted successfully');
      setIsDeleteDialogOpen(false);
      await router.invalidate();
    } catch (err) {
      toast.error('Failed to delete place type');
    } finally {
      setIsDeleting(false);
    }
  };

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
      <div className={'flex items-center justify-between'}>
        <h1 className={'text-2xl font-bold'}>Place Types</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className={'mr-2 size-4'} />
          Add Place Type
        </Button>
      </div>

      <div className={'mt-8'}>
        <div className={'max-w-md'}>
          <Input
            placeholder={'Search by name...'}
            onChange={(e) => debouncedSearch(e.target.value)}
          />
        </div>
        {items.length === 0 ? (
          <NoPlaceTypes onAddClick={() => setIsCreateModalOpen(true)} />
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
            <div className={'mt-4 rounded-md border bg-card'}>
              <PlaceTypesList
                items={items}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            </div>
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

      <CreatePlaceTypeModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      <EditPlaceTypeModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        placeType={selectedPlaceType}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title={'Delete Place Type'}
        description={`Are you sure you want to delete "${selectedPlaceType?.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        variant={'destructive'}
        isLoading={isDeleting}
        confirmText={'Delete'}
      />
    </div>
  );
}

function NoPlaceTypes({ onAddClick }: { onAddClick: () => void }) {
  return (
    <div
      className={
        'flex h-full w-full flex-col items-center justify-center py-20'
      }
    >
      <h2 className={'text-xl font-semibold'}>No place types found</h2>
      <p className={'mt-2 text-muted-foreground'}>
        There are no place types in the system matching the criteria.
      </p>
      <Button variant={'outline'} className={'mt-6'} onClick={onAddClick}>
        <Plus className={'mr-2 size-4'} />
        Add your first place type
      </Button>
    </div>
  );
}
