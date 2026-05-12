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
  activatePlace,
  deactivatePlace,
  getPlaceTypes,
  getPlacesList,
} from '#/features/parkings/api';
import { CreatePlaceModal } from '#/features/parkings/components/create-place-modal.tsx';
import { PlacesList } from '#/features/parkings/components/places-list.tsx';
import { placesListBaseInputSchema } from '#/features/parkings/schemas';
import type { PlacesListItemSchema } from '#/features/parkings/schemas';
import { AlertTriangle, MapPinned, Plus, Search } from 'lucide-react';
import { EditPlaceModal } from '#/features/parkings/components/edit-place-modal.tsx';

const DEFAULT_LIMIT = 20;
const DEFAULT_PAGE = 1;

export const Route = createFileRoute('/_protected/app/parkings/places/')({
  component: RouteComponent,
  pendingComponent: () => (
    <div className={'flex h-full w-full items-center justify-center'}>
      <Spinner className={'size-8'} />
    </div>
  ),
  validateSearch: placesListBaseInputSchema,
  loaderDeps: ({ search }) => ({
    page: search.page ?? DEFAULT_PAGE,
    limit: search.limit ?? DEFAULT_LIMIT,
    search: search.search,
  }),
  loader: async ({ deps }) => {
    try {
      const [response, placeTypesResponse] = await Promise.all([
        getPlacesList({
          data: {
            page: deps.page,
            search: deps.search,
            limit: deps.limit,
          },
        }),

        getPlaceTypes({
          data: {
            page: 1,
            limit: 100,
          },
        }),
      ]);

      return {
        items: response.data,
        placeTypes: placeTypesResponse.data,
        total: response.total,
        currentPage: response.currentPage,
        limit: deps.limit,
        error: null,
      };
    } catch (error) {
      return {
        items: [],
        placeTypes: [],
        total: 0,
        currentPage: 1,
        limit: deps.limit,
        error: 'Failed to fetch places.',
      };
    }
  },
});

function RouteComponent() {
  const { items, placeTypes, total, currentPage, limit, error } =
    Route.useLoaderData();
  const navigate = useNavigate({ from: Route.fullPath });
  const router = useRouter();
  const activatePlaceFn = useServerFn(activatePlace);
  const deactivatePlaceFn = useServerFn(deactivatePlace);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] =
    useState<PlacesListItemSchema | null>(null);
  const [statusAction, setStatusAction] = useState<
    'activate' | 'deactivate' | null
  >(null);
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

  const handleEdit = (place: PlacesListItemSchema) => {
    setSelectedPlace({
      ...place,
    });
    setIsEditModalOpen(true);
  };

  const handleStatusClick = (
    place: PlacesListItemSchema,
    action: 'activate' | 'deactivate',
  ) => {
    setSelectedPlace(place);
    setStatusAction(action);
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedPlace || !statusAction) return;

    setIsStatusUpdating(true);
    try {
      const payload = {
        placeId: selectedPlace.id,
        version: selectedPlace.version,
      };

      if (statusAction === 'activate') {
        await activatePlaceFn({ data: payload });
        toast.success('Place activated successfully');
      } else {
        await deactivatePlaceFn({ data: payload });
        toast.success('Place deactivated successfully');
      }

      setStatusAction(null);
      setSelectedPlace(null);
      await router.invalidate();
    } catch (err) {
      toast.error(`Failed to ${statusAction} place`);
    } finally {
      setIsStatusUpdating(false);
    }
  };

  if (error) {
    return (
      <PageShell
        eyebrow="Parking"
        title="Places"
        description="Browse and manage places used by parking locations."
      >
        <EmptyState
          icon={<AlertTriangle className="size-5" />}
          title="Could not load places"
          description={error}
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Parking"
      title="Places"
      description="Browse parking places, their addresses, assigned place types, and operational status."
      action={
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className={'mr-2 size-4'} />
          Add Place
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
          <NoPlaces onAddClick={() => setIsCreateModalOpen(true)} />
        ) : (
          <div className="space-y-4">
            <PlacesList
              items={items}
              onEdit={handleEdit}
              onActivate={(place) => handleStatusClick(place, 'activate')}
              onDeactivate={(place) => handleStatusClick(place, 'deactivate')}
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

      <CreatePlaceModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        placeTypes={placeTypes}
      />

      <EditPlaceModal
        open={!!selectedPlace && isEditModalOpen}
        onOpenChange={(open) => {
          setSelectedPlace(open ? selectedPlace : null);
          setIsEditModalOpen(open);
        }}
        placeTypes={placeTypes}
        placeId={selectedPlace?.id ?? ''}
      />

      <ConfirmDialog
        open={statusAction !== null}
        onOpenChange={(open) => {
          if (!open) {
            setStatusAction(null);
            setSelectedPlace(null);
          }
        }}
        title={
          statusAction === 'activate' ? 'Activate Place' : 'Deactivate Place'
        }
        description={`Are you sure you want to ${statusAction ?? 'update'} "${selectedPlace?.name}"?`}
        onConfirm={handleConfirmStatusChange}
        variant={statusAction === 'deactivate' ? 'destructive' : 'default'}
        isLoading={isStatusUpdating}
        confirmText={statusAction === 'activate' ? 'Activate' : 'Deactivate'}
      />
    </PageShell>
  );
}

function NoPlaces({ onAddClick }: { onAddClick: () => void }) {
  return (
    <EmptyState
      icon={<MapPinned className="size-5" />}
      title="No places found"
      description="There are no places matching the current search criteria."
      action={
        <Button variant={'outline'} className={'mt-6'} onClick={onAddClick}>
          <Plus className={'mr-2 size-4'} />
          Add your first place
        </Button>
      }
    />
  );
}
