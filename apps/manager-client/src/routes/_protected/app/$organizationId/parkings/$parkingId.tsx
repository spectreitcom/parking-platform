import { Link, createFileRoute, redirect } from '@tanstack/react-router';
import {
  ArrowLeftIcon,
  Building2Icon,
  CalendarClockIcon,
  CheckCircle2Icon,
  CircleSlashIcon,
  FileTextIcon,
  Layers3Icon,
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  ShieldCheckIcon,
  Trash2Icon,
  XCircleIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert.tsx';
import { Button } from '#/components/ui/button.tsx';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '#/components/ui/card.tsx';
import { Separator } from '#/components/ui/separator.tsx';
import { Spinner } from '#/components/ui/spinner.tsx';
import { getParkingDetails } from '#/features/parking/api';

export const Route = createFileRoute(
  '/_protected/app/$organizationId/parkings/$parkingId',
)({
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
  loader: async ({ params }) => {
    try {
      const parking = await getParkingDetails({
        data: { parkingId: params.parkingId },
      });

      return { parking, error: null };
    } catch {
      return {
        parking: null,
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
  const { parking, error } = Route.useLoaderData();

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
          <ActionButton enabled={parking.actions.edit} icon={PencilIcon}>
            Edit
          </ActionButton>
          <ActionButton
            enabled={parking.actions.addParkingSpot}
            icon={PlusIcon}
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
              <PermissionRow label="Edit parking" enabled={parking.actions.edit} />
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
              <DetailItem label="Created" value={formatDate(parking.createdAt)} />
              <DetailItem label="Updated" value={formatDate(parking.updatedAt)} />
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
  variant = 'outline',
}: Readonly<{
  children: ReactNode;
  enabled: boolean;
  icon: LucideIcon;
  variant?: 'outline' | 'destructive';
}>) {
  return (
    <Button variant={variant} size="sm" disabled={!enabled}>
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
            enabled ? 'size-3.5 text-green-600' : 'size-3.5 text-muted-foreground'
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
