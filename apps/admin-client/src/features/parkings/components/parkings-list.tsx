import type { ParkingListItemSchema } from '#/features/parkings/schemas';
import { Link } from '@tanstack/react-router';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table.tsx';
import {
  MoreHorizontal,
  MapPin,
  Building2,
  ParkingCircle,
  SquareArrowOutUpRight,
  Power,
  PowerOff,
} from 'lucide-react';
import { Button } from '#/components/ui/button.tsx';
import { StatusBadge } from '#/components/status-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu';

type Props = Readonly<{
  items: ParkingListItemSchema[];
  onStatusChange: (parking: ParkingListItemSchema) => void;
}>;

export function ParkingsList({ items, onStatusChange }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[250px]">Name</TableHead>
          <TableHead>Organization</TableHead>
          <TableHead>Place</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((parking) => (
          <TableRow
            key={parking.id}
            className="group transition-colors hover:bg-muted/50"
          >
            <TableCell className="font-medium">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background text-primary shadow-xs">
                  <ParkingCircle className="size-4" />
                </div>
                <span className="truncate text-foreground">
                  <Link
                    to="/app/parkings/$parkingId"
                    params={{ parkingId: parking.id }}
                    className="rounded-sm outline-none hover:text-primary hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/25"
                  >
                    {parking.name}
                  </Link>
                </span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4 shrink-0" />
                <span className="truncate">{parking.organization.name}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate">{parking.place.name}</span>
              </div>
            </TableCell>
            <TableCell>
              <StatusBadge tone={parking.active ? 'positive' : 'negative'}>
                {parking.active ? 'Active' : 'Inactive'}
              </StatusBadge>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link
                      to="/app/parkings/$parkingId"
                      params={{ parkingId: parking.id }}
                    >
                      <SquareArrowOutUpRight className="mr-2 h-4 w-4" />
                      View details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => onStatusChange(parking)}
                    variant={parking.active ? 'destructive' : 'default'}
                  >
                    {parking.active ? (
                      <PowerOff className="mr-2 h-4 w-4" />
                    ) : (
                      <Power className="mr-2 h-4 w-4" />
                    )}
                    {parking.active ? 'Deactivate' : 'Activate'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
