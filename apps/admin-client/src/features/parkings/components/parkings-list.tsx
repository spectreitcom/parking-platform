import type { ParkingListItemSchema } from '#/features/parkings/schemas';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table.tsx';
import { MoreHorizontal, Circle, MapPin, Building2 } from 'lucide-react';
import { Button } from '#/components/ui/button.tsx';
import { cn } from '#/lib/utils';

type Props = Readonly<{
  items: ParkingListItemSchema[];
}>;

export function ParkingsList({ items }: Props) {
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
              <span className="truncate">{parking.name}</span>
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
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border',
                  parking.active
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                    : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
                )}
              >
                <Circle
                  className={cn(
                    'h-1.5 w-1.5 fill-current',
                    parking.active ? 'text-emerald-500' : 'text-red-500',
                  )}
                />
                {parking.active ? 'Active' : 'Inactive'}
              </span>
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
