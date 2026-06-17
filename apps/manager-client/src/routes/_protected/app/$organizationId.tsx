import { createFileRoute, redirect } from '@tanstack/react-router';
import {
  CheckCircle2Icon,
  MapPinIcon,
  ParkingSquareIcon,
  XCircleIcon,
} from 'lucide-react';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '#/components/ui/card.tsx';
import { Pagination } from '#/components/pagination.tsx';
import { getParkings } from '#/features/parking/api';
import { Spinner } from '#/components/ui/spinner.tsx';

const PARKINGS_PAGE_SIZE = 24;

const parkingSearchSchema = z
  .object({
    page: z.coerce.number().int().positive().catch(1),
  })
  .transform(({ page }): { page?: number } => (page === 1 ? {} : { page }));

export const Route = createFileRoute('/_protected/app/$organizationId')({
  validateSearch: (search) => parkingSearchSchema.parse(search),
  loaderDeps: ({ search: { page } }) => ({ page: page ?? 1 }),
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
      const parkingListResponse = await getParkings({
        data: {
          page: deps.page,
          organizationId: params.organizationId,
          limit: PARKINGS_PAGE_SIZE,
        },
      });

      return {
        parkings: parkingListResponse.data,
        currentPage: parkingListResponse.currentPage,
        total: parkingListResponse.total,
        error: null,
      };
    } catch {
      return {
        parkings: [],
        currentPage: 1,
        total: 0,
        error: 'Failed to fetch parkings. Please try again later.',
      };
    }
  },
  component: RouteComponent,
  pendingComponent: () => (
    <div className={'flex h-full w-full items-center justify-center'}>
      <Spinner className={'size-8'} />
    </div>
  ),
});

function RouteComponent() {
  const { organizationId } = Route.useParams();
  const navigate = Route.useNavigate();
  const { user } = Route.useRouteContext();
  const organization = user.organizations.find(
    (item) => item.id === organizationId,
  );
  const { parkings, error, currentPage, total } = Route.useLoaderData();
  const handlePageChange = (page: number) => {
    void navigate({
      search: (previous) => ({
        ...previous,
        page: page === 1 ? undefined : page,
      }),
    });
  };

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
              {error ??
                (parkings.length > 0
                  ? `${total} parking locations`
                  : 'Parking locations assigned to this organization')}
            </p>
          </div>
          <Pagination
            total={total}
            page={currentPage}
            pageSize={PARKINGS_PAGE_SIZE}
            onPageChange={handlePageChange}
          />
        </div>

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
