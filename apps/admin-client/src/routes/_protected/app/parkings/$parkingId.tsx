import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useState } from 'react';
import { toast } from 'sonner';
import type { ReactNode } from 'react';
import { ConfirmDialog } from '#/components/confirm-dialog.tsx';
import { EmptyState, PageShell } from '#/components/page-shell';
import { StatusBadge } from '#/components/status-badge';
import { Button } from '#/components/ui/button.tsx';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card.tsx';
import { Spinner } from '#/components/ui/spinner.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table.tsx';
import {
  activateParking,
  deactivateParking,
  getParkingDetails,
  getParkingSpotsByParkingId,
} from '#/features/parkings/api';
import { EditParkingModal } from '#/features/parkings/components/edit-parking-modal.tsx';
import type {
  ParkingDetailsSchema,
  ParkingSpotListItemSchema,
} from '#/features/parkings/schemas';
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CalendarClock,
  CarFront,
  Layers3,
  MapPin,
  Package,
  ParkingCircle,
  Pencil,
  Power,
  PowerOff,
  Tag,
  Sparkles,
} from 'lucide-react';

const PARKING_SPOTS_LIMIT = 100;

export const Route = createFileRoute('/_protected/app/parkings/$parkingId')({
  component: RouteComponent,
  pendingComponent: () => (
    <div className={'flex h-full w-full items-center justify-center'}>
      <Spinner className={'size-8'} />
    </div>
  ),
  loader: async ({ params }) => {
    try {
      const [parking, parkingSpotsResponse] = await Promise.all([
        getParkingDetails({
          data: {
            parkingId: params.parkingId,
          },
        }),
        getParkingSpotsByParkingId({
          data: {
            parkingId: params.parkingId,
            page: 1,
            limit: PARKING_SPOTS_LIMIT,
          },
        }),
      ]);

      return {
        parking,
        parkingSpots: parkingSpotsResponse.data,
        parkingSpotsTotal: parkingSpotsResponse.total,
        error: null,
      };
    } catch (error) {
      return {
        parking: null,
        parkingSpots: [],
        parkingSpotsTotal: 0,
        error: 'Failed to fetch parking details.',
      };
    }
  },
});

function RouteComponent() {
  const { parking, parkingSpots, parkingSpotsTotal, error } =
    Route.useLoaderData();
  const router = useRouter();
  const activateParkingFn = useServerFn(activateParking);
  const deactivateParkingFn = useServerFn(deactivateParking);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  const handleConfirmStatusChange = async () => {
    if (!parking) return;

    setIsStatusUpdating(true);
    try {
      const payload = {
        parkingId: parking.id,
        version: parking.version,
      };

      if (parking.active) {
        await deactivateParkingFn({ data: payload });
        toast.success('Parking deactivated successfully');
      } else {
        await activateParkingFn({ data: payload });
        toast.success('Parking activated successfully');
      }

      setIsStatusDialogOpen(false);
      await router.invalidate();
    } catch (err) {
      toast.error(
        parking.active
          ? 'Failed to deactivate parking'
          : 'Failed to activate parking',
      );
    } finally {
      setIsStatusUpdating(false);
    }
  };

  if (error || !parking) {
    return (
      <PageShell
        eyebrow="Parking"
        title="Parking details"
        description="Review parking profile, location, assigned place, and operational metadata."
        action={<BackButton />}
      >
        <EmptyState
          icon={<AlertTriangle className="size-5" />}
          title="Could not load parking"
          description={error}
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Parking"
      title={parking.name}
      description="Review parking profile, location, assigned place, and operational metadata."
      action={
        <div className="flex flex-col gap-2 sm:flex-row">
          <BackButton />
          <Button
            variant={parking.active ? 'destructive' : 'outline'}
            onClick={() => setIsStatusDialogOpen(true)}
          >
            {parking.active ? (
              <PowerOff className="size-4" />
            ) : (
              <Power className="size-4" />
            )}
            {parking.active ? 'Deactivate' : 'Activate'}
          </Button>
          <Button onClick={() => setIsEditModalOpen(true)}>
            <Pencil className="size-4" />
            Edit Parking
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <ParkingProfile parking={parking} />
        <ParkingStats parking={parking} />
      </div>

      <ParkingAssociations parking={parking} />
      <ParkingConfiguration parking={parking} />
      <ParkingSpots
        items={parkingSpots}
        total={parkingSpotsTotal}
        displayedLimit={PARKING_SPOTS_LIMIT}
      />

      <EditParkingModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        parking={parking}
      />
      <ConfirmDialog
        open={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
        title={`${parking.active ? 'Deactivate' : 'Activate'} Parking`}
        description={`Are you sure you want to ${parking.active ? 'deactivate' : 'activate'} "${parking.name}"?`}
        onConfirm={handleConfirmStatusChange}
        variant={parking.active ? 'destructive' : 'default'}
        isLoading={isStatusUpdating}
        confirmText={parking.active ? 'Deactivate' : 'Activate'}
      />
    </PageShell>
  );
}

function ParkingSpots({
  items,
  total,
  displayedLimit,
}: Readonly<{
  items: ParkingSpotListItemSchema[];
  total: number;
  displayedLimit: number;
}>) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Parking spots</CardTitle>
            <CardDescription>
              Spots assigned to this parking and their enabled features.
            </CardDescription>
          </div>
          <StatusBadge tone="neutral">
            {total === 1 ? '1 spot' : `${total} spots`}
          </StatusBadge>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="rounded-md border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
            No parking spots assigned
          </p>
        ) : (
          <div className="space-y-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[260px]">Spot</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Features</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Version</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((spot) => (
                  <TableRow
                    key={spot.id}
                    className="transition-colors hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background text-primary shadow-xs">
                          <CarFront className="size-4" />
                        </div>
                        <span className="truncate text-foreground">
                          {spot.id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{formatPLN(spot.price)}</TableCell>
                    <TableCell>
                      {spot.parkingSpotFeatures.length === 0 ? (
                        <span className="text-muted-foreground">
                          No features
                        </span>
                      ) : (
                        <div className="flex max-w-xl flex-wrap gap-1.5">
                          {spot.parkingSpotFeatures.map((feature) => (
                            <StatusBadge key={feature.id} tone="neutral">
                              {feature.name}
                            </StatusBadge>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge tone={spot.active ? 'positive' : 'negative'}>
                        {spot.active ? 'Active' : 'Inactive'}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>v{spot.version}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {total > displayedLimit ? (
              <p className="text-right text-xs text-muted-foreground">
                Showing first {displayedLimit} of {total} spots.
              </p>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BackButton() {
  return (
    <Button variant="outline" asChild>
      <Link to="/app/parkings">
        <ArrowLeft className="size-4" />
        Parkings
      </Link>
    </Button>
  );
}

function ParkingProfile({
  parking,
}: Readonly<{
  parking: ParkingDetailsSchema;
}>) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Core location information for this parking.
            </CardDescription>
          </div>
          <StatusBadge tone={parking.active ? 'positive' : 'negative'}>
            {parking.active ? 'Active' : 'Inactive'}
          </StatusBadge>
        </div>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2">
          <DetailItem
            icon={<ParkingCircle className="size-4" />}
            label="Name"
            value={parking.name}
          />
          <DetailItem
            icon={<MapPin className="size-4" />}
            label="Address"
            value={parking.address}
            className="sm:col-span-2"
          />
          <DetailItem
            icon={<MapPin className="size-4" />}
            label="Coordinates"
            value={`${formatCoordinate(parking.latitude)}, ${formatCoordinate(
              parking.longitude,
            )}`}
          />
          <DetailItem
            icon={<CalendarClock className="size-4" />}
            label="Updated"
            value={formatDateTime(parking.updatedAt)}
          />
          <DetailItem
            icon={<Layers3 className="size-4" />}
            label="Statute"
            value={parking.statute || 'Not provided'}
            className="sm:col-span-2"
          />
          <DetailItem
            icon={<CarFront className="size-4" />}
            label="Description"
            value={parking.description || 'Not provided'}
            className="sm:col-span-2"
          />
        </dl>
      </CardContent>
    </Card>
  );
}

function ParkingStats({
  parking,
}: Readonly<{
  parking: ParkingDetailsSchema;
}>) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
      <MetricCard
        icon={<Sparkles className="size-4" />}
        label="Features"
        value={parking.parkingFeatures.length.toString()}
      />
      <MetricCard
        icon={<Package className="size-4" />}
        label="Addons"
        value={parking.parkingAddons.length.toString()}
      />
      <MetricCard
        icon={<Package className="size-4" />}
        label="Assets"
        value={parking.assetIds.length.toString()}
      />
      <MetricCard
        icon={<CalendarClock className="size-4" />}
        label="Created"
        value={formatDate(parking.createdAt)}
      />
    </div>
  );
}

function ParkingAssociations({
  parking,
}: Readonly<{
  parking: ParkingDetailsSchema;
}>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Associations</CardTitle>
        <CardDescription>
          Organization and place assigned to this parking.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2">
          <DetailItem
            icon={<Building2 className="size-4" />}
            label="Organization"
            value={parking.organization.name}
          />
          <DetailItem
            icon={<MapPin className="size-4" />}
            label="Place"
            value={parking.place.name}
          />
          <DetailItem
            icon={<Tag className="size-4" />}
            label="Version"
            value={`v${parking.version}`}
          />
          <DetailItem
            icon={<CalendarClock className="size-4" />}
            label="Created"
            value={formatDateTime(parking.createdAt)}
          />
        </dl>
      </CardContent>
    </Card>
  );
}

function ParkingConfiguration({
  parking,
}: Readonly<{
  parking: ParkingDetailsSchema;
}>) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <CollectionCard
        icon={<Sparkles className="size-4" />}
        title="Features"
        description="Capabilities enabled for this parking."
        emptyLabel="No features assigned"
        items={parking.parkingFeatures.map((feature) => feature.name)}
      />
      <CollectionCard
        icon={<Package className="size-4" />}
        title="Addons"
        description="Additional services available at this parking."
        emptyLabel="No addons assigned"
        items={parking.parkingAddons.map((addon) => addon.name)}
      />
      <CollectionCard
        icon={<Layers3 className="size-4" />}
        title="Assets"
        description="Asset identifiers connected to this parking."
        emptyLabel="No assets assigned"
        items={parking.assetIds}
      />
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
  className,
}: Readonly<{
  icon: ReactNode;
  label: string;
  value: string;
  className?: string;
}>) {
  return (
    <div className={className}>
      <dt className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="mt-2 break-words text-sm font-medium leading-6 text-foreground">
        {value}
      </dd>
    </div>
  );
}

function CollectionCard({
  icon,
  title,
  description,
  emptyLabel,
  items,
}: Readonly<{
  icon: ReactNode;
  title: string;
  description: string;
  emptyLabel: string;
  items: Array<string>;
}>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="rounded-md border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
            {emptyLabel}
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {items.map((item, index) => (
              <li className="min-w-0" key={`${item}-${index}`}>
                <StatusBadge className="max-w-full break-all" tone="neutral">
                  {item}
                </StatusBadge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: Readonly<{
  icon: ReactNode;
  label: string;
  value: string;
}>) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-background text-primary shadow-xs">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 break-words text-2xl font-semibold leading-none">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function formatCoordinate(value: number) {
  return value.toFixed(6);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
  }).format(value);
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
}

function formatPLN(value: number) {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'PLN',
  }).format(value);
}
