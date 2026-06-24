import {
  Link,
  createFileRoute,
  redirect,
  useRouter,
} from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import {
  ArrowLeftIcon,
  Building2Icon,
  CalendarClockIcon,
  CheckCircle2Icon,
  CircleSlashIcon,
  FileTextIcon,
  ImageIcon,
  Layers3Icon,
  MapPinIcon,
  ParkingSquareIcon,
  PencilIcon,
  PlusIcon,
  ShieldCheckIcon,
  Trash2Icon,
  XCircleIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert.tsx';
import { Button } from '#/components/ui/button.tsx';
import { Pagination } from '#/components/pagination.tsx';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '#/components/ui/card.tsx';
import { Separator } from '#/components/ui/separator.tsx';
import { Spinner } from '#/components/ui/spinner.tsx';
import { AssetImage } from '#/features/assets/components/asset-image.tsx';
import { getParkingDetails } from '#/features/parking/api';
import { EditParkingModal } from '#/features/parking/components/edit-parking-modal.tsx';
import {
  activateParkingSpot,
  deactivateParkingSpot,
  getParkingSpotsForParking,
} from '#/features/parking-spots/api';
import {
  AddParkingSpotModal,
  UpdateParkingSpotModal,
} from '#/features/parking-spots/components/add-parking-spot-modal.tsx';
import type { parkingSpotListItemSchema } from '#/features/parking-spots/schemas';

type ParkingSpotListItem = z.infer<typeof parkingSpotListItemSchema>;

const PARKING_SPOTS_PAGE_SIZE = 24;

const parkingDetailsSearchSchema = z
  .object({
    spotsPage: z.coerce.number().int().positive().catch(1),
  })
  .transform(({ spotsPage }): { spotsPage?: number } =>
    spotsPage === 1 ? {} : { spotsPage },
  );

export const Route = createFileRoute(
  '/_protected/app/$organizationId/parkings/$parkingId',
)({
  validateSearch: (search) => parkingDetailsSearchSchema.parse(search),
  loaderDeps: ({ search: { spotsPage } }) => ({ spotsPage: spotsPage ?? 1 }),
  beforeLoad: ({ context, params }) => {
    const organization = context.user.organizations.find(
      (item) => item.id === params.organizationId,
    );

    if (!organization) {
      const fallbackOrganization = context.user.organizations.at(0);

      if (fallbackOrganization) {
        throw redirect({
          to: '/app/$organizationId',
          params: { organizationId: fallbackOrganization.id },
        });
      }
    }
  },
  loader: async ({ params, deps }) => {
    try {
      const parking = await getParkingDetails({
        data: { parkingId: params.parkingId },
      });

      try {
        const parkingSpotsResponse = await getParkingSpotsForParking({
          data: {
            parkingId: params.parkingId,
            page: deps.spotsPage,
            limit: PARKING_SPOTS_PAGE_SIZE,
          },
        });

        return {
          parking,
          parkingSpots: parkingSpotsResponse.data,
          parkingSpotsCurrentPage: parkingSpotsResponse.currentPage,
          parkingSpotsTotal: parkingSpotsResponse.total,
          parkingSpotsError: null,
          error: null,
        };
      } catch {
        return {
          parking,
          parkingSpots: [],
          parkingSpotsCurrentPage: 1,
          parkingSpotsTotal: 0,
          parkingSpotsError:
            'Failed to fetch parking spots. Please try again later.',
          error: null,
        };
      }
    } catch {
      return {
        parking: null,
        parkingSpots: [],
        parkingSpotsCurrentPage: 1,
        parkingSpotsTotal: 0,
        parkingSpotsError: null,
        error: 'Failed to fetch parking details. Please try again later.',
      };
    }
  },
  component: RouteComponent,
  pendingComponent: () => (
    <div className="flex h-full w-full items-center justify-center">
      <Spinner className="size-8" />
    </div>
  ),
});

function RouteComponent() {
  const { organizationId } = Route.useParams();
  const navigate = Route.useNavigate();
  const router = useRouter();
  const [editParkingOpen, setEditParkingOpen] = useState(false);
  const [addParkingSpotOpen, setAddParkingSpotOpen] = useState(false);
  const [parkingSpotToEdit, setParkingSpotToEdit] =
    useState<ParkingSpotListItem | null>(null);
  const [parkingSpotStatusPendingId, setParkingSpotStatusPendingId] = useState<
    string | null
  >(null);
  const activateParkingSpotFn = useServerFn(activateParkingSpot);
  const deactivateParkingSpotFn = useServerFn(deactivateParkingSpot);
  const {
    parking,
    parkingSpots,
    parkingSpotsCurrentPage,
    parkingSpotsError,
    parkingSpotsTotal,
    error,
  } = Route.useLoaderData();
  const handleParkingSpotsPageChange = (spotsPage: number) => {
    void navigate({
      search: (previous) => ({
        ...previous,
        spotsPage: spotsPage === 1 ? undefined : spotsPage,
      }),
    });
  };
  const handleParkingSpotStatusToggle = async (
    parkingSpot: ParkingSpotListItem,
  ) => {
    setParkingSpotStatusPendingId(parkingSpot.id);

    try {
      const payload = {
        parkingSpotId: parkingSpot.id,
        version: parkingSpot.version,
      };

      if (parkingSpot.active) {
        await deactivateParkingSpotFn({ data: payload });
        toast.success('Parking spot deactivated');
      } else {
        await activateParkingSpotFn({ data: payload });
        toast.success('Parking spot activated');
      }

      await router.invalidate();
    } catch (caughtError) {
      toast.error(
        caughtError instanceof Error
          ? caughtError.message
          : 'Failed to update parking spot status',
      );
    } finally {
      setParkingSpotStatusPendingId(null);
    }
  };

  if (error || !parking) {
    return (
      <div className="mx-auto flex min-h-[calc(100svh-7rem)] w-full max-w-2xl items-center">
        <Alert variant="destructive">
          <CircleSlashIcon aria-hidden="true" />
          <AlertTitle>Parking details unavailable</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link to="/app/$organizationId" params={{ organizationId }}>
              <ArrowLeftIcon aria-hidden="true" />
              Parkings
            </Link>
          </Button>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="break-words text-2xl font-semibold tracking-tight">
                {parking.name}
              </h1>
              <ParkingStatus active={parking.active} />
            </div>
            <p className="max-w-3xl text-sm text-muted-foreground">
              {parking.description || 'No description provided.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <ActionButton
            enabled={parking.actions.edit}
            icon={PencilIcon}
            onClick={() => setEditParkingOpen(true)}
          >
            Edit
          </ActionButton>
          <ActionButton
            enabled={parking.actions.addParkingSpot}
            icon={PlusIcon}
            onClick={() => setAddParkingSpotOpen(true)}
          >
            Add spot
          </ActionButton>
          <ActionButton
            enabled={parking.actions.removeParkingSpot}
            icon={Trash2Icon}
            variant="destructive"
          >
            Remove spot
          </ActionButton>
        </div>
      </div>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(22rem,0.75fr)]">
        <div className="space-y-4">
          {parking.assetIds.length > 0 && (
            <Card className="rounded-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ImageIcon
                    aria-hidden="true"
                    className="size-4 text-muted-foreground"
                  />
                  Images
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {parking.assetIds.map((assetId) => (
                    <AssetImage
                      key={assetId}
                      assetId={assetId}
                      alt={`${parking.name} image`}
                      width={360}
                      height={200}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPinIcon
                  aria-hidden="true"
                  className="size-4 text-muted-foreground"
                />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <DetailItem label="Place" value={parking.place.name} />
              <DetailItem label="Address" value={parking.place.address} />
              <DetailItem
                label="Latitude"
                value={formatCoordinate(parking.coords.latitude)}
              />
              <DetailItem
                label="Longitude"
                value={formatCoordinate(parking.coords.longitude)}
              />
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Layers3Icon
                  aria-hidden="true"
                  className="size-4 text-muted-foreground"
                />
                Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <TagGroup
                title="Features"
                items={parking.parkingFeatures.map((item) => item.name)}
              />
              <TagGroup
                title="Add-ons"
                items={parking.parkingAddons.map((item) => item.name)}
              />
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileTextIcon
                  aria-hidden="true"
                  className="size-4 text-muted-foreground"
                />
                Statute
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                {parking.statute || 'No statute provided.'}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2Icon
                  aria-hidden="true"
                  className="size-4 text-muted-foreground"
                />
                Organization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DetailItem label="Name" value={parking.organization.name} />
              <DetailItem
                label="Address"
                value={parking.organization.address}
              />
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheckIcon
                  aria-hidden="true"
                  className="size-4 text-muted-foreground"
                />
                Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <PermissionRow
                label="Edit parking"
                enabled={parking.actions.edit}
              />
              <PermissionRow
                label="Add parking spot"
                enabled={parking.actions.addParkingSpot}
              />
              <PermissionRow
                label="Remove parking spot"
                enabled={parking.actions.removeParkingSpot}
              />
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarClockIcon
                  aria-hidden="true"
                  className="size-4 text-muted-foreground"
                />
                Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DetailItem
                label="Created"
                value={formatDate(parking.createdAt)}
              />
              <DetailItem
                label="Updated"
                value={formatDate(parking.updatedAt)}
              />
              <DetailItem label="Version" value={parking.version.toString()} />
              <DetailItem
                label="Assets"
                value={`${parking.assetIds.length} linked assets`}
              />
              <Separator />
              <DetailItem label="Parking ID" value={parking.id} />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Parking spots
            </h2>
            <p className="text-sm text-muted-foreground">
              {parkingSpotsError ??
                (parkingSpots.length > 0
                  ? `${parkingSpotsTotal} spots assigned to this parking`
                  : 'Spots assigned to this parking')}
            </p>
          </div>
          <Pagination
            total={parkingSpotsTotal}
            page={parkingSpotsCurrentPage}
            pageSize={PARKING_SPOTS_PAGE_SIZE}
            onPageChange={handleParkingSpotsPageChange}
          />
        </div>

        {parkingSpots.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {parkingSpots.map((parkingSpot) => (
              <Card key={parkingSpot.id} className="gap-4 rounded-lg">
                <CardHeader className="gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-2">
                      <div className="flex size-10 items-center justify-center rounded-md border bg-muted">
                        <ParkingSquareIcon
                          aria-hidden="true"
                          className="size-5 text-muted-foreground"
                        />
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        type="button"
                        variant={parkingSpot.active ? 'outline' : 'default'}
                        size="xs"
                        disabled={
                          !parking.actions.edit ||
                          parkingSpotStatusPendingId !== null
                        }
                        aria-label={
                          parkingSpot.active
                            ? 'Deactivate parking spot'
                            : 'Activate parking spot'
                        }
                        onClick={() => {
                          void handleParkingSpotStatusToggle(parkingSpot);
                        }}
                      >
                        {parkingSpotStatusPendingId === parkingSpot.id ? (
                          <Spinner aria-hidden="true" className="size-3" />
                        ) : parkingSpot.active ? (
                          <XCircleIcon aria-hidden="true" />
                        ) : (
                          <CheckCircle2Icon aria-hidden="true" />
                        )}
                        {parkingSpot.active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={!parking.actions.edit}
                        aria-label="Edit parking spot"
                        onClick={() => setParkingSpotToEdit(parkingSpot)}
                      >
                        <PencilIcon aria-hidden="true" />
                      </Button>
                      <ParkingStatus active={parkingSpot.active} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <DetailItem
                      label="Price"
                      value={formatPrice(parkingSpot.price)}
                    />
                  </div>
                  <TagGroup
                    title="Features"
                    items={parkingSpot.parkingSpotFeatures.map(
                      (item) => item.name,
                    )}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
      </section>

      <AddParkingSpotModal
        open={addParkingSpotOpen}
        parkingId={parking.id}
        onOpenChange={setAddParkingSpotOpen}
        onParkingSpotAdded={async () => {
          await router.invalidate();
        }}
      />
      {parkingSpotToEdit ? (
        <UpdateParkingSpotModal
          key={parkingSpotToEdit.id}
          open={true}
          parkingSpot={parkingSpotToEdit}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setParkingSpotToEdit(null);
            }
          }}
          onParkingSpotUpdated={async () => {
            setParkingSpotToEdit(null);
            await router.invalidate();
          }}
        />
      ) : null}
      <EditParkingModal
        open={editParkingOpen}
        parking={parking}
        onOpenChange={setEditParkingOpen}
        onParkingUpdated={async () => {
          await router.invalidate();
        }}
      />
    </div>
  );
}

function ParkingStatus({ active }: Readonly<{ active: boolean }>) {
  const Icon = active ? CheckCircle2Icon : XCircleIcon;

  return (
    <div className="inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium">
      <Icon
        aria-hidden="true"
        className={
          active ? 'size-3.5 text-green-600' : 'size-3.5 text-muted-foreground'
        }
      />
      <span>{active ? 'Active' : 'Inactive'}</span>
    </div>
  );
}

function ActionButton({
  children,
  enabled,
  icon: Icon,
  onClick,
  variant = 'outline',
}: Readonly<{
  children: ReactNode;
  enabled: boolean;
  icon: LucideIcon;
  onClick?: () => void;
  variant?: 'outline' | 'destructive';
}>) {
  return (
    <Button variant={variant} size="sm" disabled={!enabled} onClick={onClick}>
      <Icon aria-hidden="true" />
      {children}
    </Button>
  );
}

function DetailItem({
  label,
  value,
}: Readonly<{ label: string; value: string }>) {
  return (
    <div className="min-w-0 space-y-1">
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </p>
      <p className="break-words text-sm font-medium">{value || '-'}</p>
    </div>
  );
}

function TagGroup({
  title,
  items,
}: Readonly<{ title: string; items: Array<string> }>) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">{title}</h3>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className="rounded-md border bg-muted px-2 py-1 text-xs font-medium"
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">None assigned.</p>
      )}
    </div>
  );
}

function PermissionRow({
  label,
  enabled,
}: Readonly<{ label: string; enabled: boolean }>) {
  const Icon = enabled ? CheckCircle2Icon : XCircleIcon;

  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="inline-flex items-center gap-1.5 font-medium">
        <Icon
          aria-hidden="true"
          className={
            enabled
              ? 'size-3.5 text-green-600'
              : 'size-3.5 text-muted-foreground'
          }
        />
        {enabled ? 'Allowed' : 'Blocked'}
      </span>
    </div>
  );
}

function formatCoordinate(value: number) {
  return value.toFixed(6);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'PLN',
  }).format(value);
}
