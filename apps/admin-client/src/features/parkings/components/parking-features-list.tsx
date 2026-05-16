import type { ParkingFeaturesListItemSchema } from '#/features/parkings/schemas';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table.tsx';
import { Button } from '#/components/ui/button.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu';
import {
  Layers3,
  MoreHorizontal,
  Pencil,
  Sparkles,
  Trash2,
} from 'lucide-react';

type Props = Readonly<{
  items: ParkingFeaturesListItemSchema[];
  onEdit: (item: ParkingFeaturesListItemSchema) => void;
  onDelete: (item: ParkingFeaturesListItemSchema) => void;
}>;

export function ParkingFeaturesList({ items, onEdit, onDelete }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[250px]">Name</TableHead>
          <TableHead>Levels</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((feature) => (
          <TableRow
            key={feature.id}
            className="group transition-colors hover:bg-muted/50"
          >
            <TableCell className="font-medium">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background text-primary shadow-xs">
                  <Sparkles className="size-4" />
                </div>
                <span className="truncate text-foreground">{feature.name}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex min-w-0 items-center gap-2 text-muted-foreground">
                <Layers3 className="size-4 shrink-0" />
                <div className="flex flex-wrap gap-1.5">
                  {feature.levels.length > 0 ? (
                    feature.levels.map((level, index) => (
                      <span
                        key={`${level}-${index}`}
                        className="inline-flex max-w-40 items-center truncate rounded-full border bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                      >
                        {level}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm">No levels configured</span>
                  )}
                </div>
              </div>
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
                  <DropdownMenuItem onClick={() => onEdit(feature)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => onDelete(feature)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
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
