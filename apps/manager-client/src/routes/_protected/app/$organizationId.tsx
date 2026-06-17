import { queryOptions, useQuery } from '@tanstack/react-query';
import { createFileRoute, redirect } from '@tanstack/react-router';
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  MapPinIcon,
  ParkingSquareIcon,
  XCircleIcon,
} from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert.tsx';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '#/components/ui/card.tsx';
import { Skeleton } from '#/components/ui/skeleton.tsx';
import { getParkings } from '#/features/parking/api';

const PARKINGS_PAGE_SIZE = 24;

function parkingListQueryOptions(organizationId: string) {
  return queryOptions({
    queryKey: ['parkings', organizationId],
    queryFn: () =>
      getParkings({
        data: {
          organizationId,
          limit: PARKINGS_PAGE_SIZE,
        },
      }),
  });
}

export const Route = createFileRoute('/_protected/app/$organizationId')({
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
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      parkingListQueryOptions(params.organizationId),
    ),
  component: RouteComponent,
});

function RouteComponent() {
  const { organizationId } = Route.useParams();
  const { user } = Route.useRouteContext();
  const organization = user.organizations.find(
    (item) => item.id === organizationId,
  );
  const parkingsQuery = useQuery(parkingListQueryOptions(organizationId));
  const parkings = parkingsQuery.data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {organization?.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage parking operations for this organization.
        </p>
      </div>

      <section className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Parkings</h2>
            <p className="text-sm text-muted-foreground">
              {parkingsQuery.data
                ? `${parkingsQuery.data.total} parking locations`
                : 'Parking locations assigned to this organization'}
            </p>
          </div>
        </div>

        {parkingsQuery.isLoading ? <ParkingGridSkeleton /> : null}
        {parkingsQuery.isError ? (
          <Alert variant="destructive">
            <AlertCircleIcon aria-hidden="true" />
            <AlertTitle>Could not load parkings</AlertTitle>
            <AlertDescription>{parkingsQuery.error.message}</AlertDescription>
          </Alert>
        ) : null}
        {parkingsQuery.isSuccess && parkings.length === 0 ? (
          <EmptyParkingList />
        ) : null}
        {parkings.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {parkings.map((parking) => (
              <Card key={parking.id} className="gap-4 rounded-lg">
                <CardHeader className="gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-2">
                      <div className="flex size-10 items-center justify-center rounded-md border bg-muted">
                        <ParkingSquareIcon
                          aria-hidden="true"
                          className="size-5 text-muted-foreground"
                        />
                      </div>
                      <CardTitle className="truncate text-base">
                        {parking.name}
                      </CardTitle>
                    </div>
                    <ParkingStatus active={parking.active} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex gap-2 text-muted-foreground">
                    <MapPinIcon
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">
                        {parking.place.name}
                      </p>
                      <p className="break-words">{parking.place.address}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function ParkingStatus({ active }: { active: boolean }) {
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

function ParkingGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="gap-4 rounded-lg">
          <CardHeader className="gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="size-10 rounded-md" />
                <Skeleton className="h-5 w-40" />
              </div>
              <Skeleton className="h-7 w-20 rounded-md" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyParkingList() {
  return (
    <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed p-6 text-center">
      <div className="space-y-2">
        <ParkingSquareIcon
          aria-hidden="true"
          className="mx-auto size-8 text-muted-foreground"
        />
        <h3 className="font-medium">No parkings found</h3>
        <p className="max-w-md text-sm text-muted-foreground">
          This organization does not have any parking locations assigned yet.
        </p>
      </div>
    </div>
  );
}
