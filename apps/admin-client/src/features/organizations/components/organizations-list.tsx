import type { OrganizationListItemSchema } from '#/features/organizations/schemas';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu';
import { Button } from '#/components/ui/button.tsx';
import {
  Building2,
  Hash,
  MapPin,
  MoreHorizontal,
  Pencil,
  SquareArrowOutUpRight,
  Users,
} from 'lucide-react';

type Props = Readonly<{
  items: OrganizationListItemSchema[];
  onEdit: (item: OrganizationListItemSchema) => void;
}>;

export function OrganizationsList({ items, onEdit }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[250px]">Name</TableHead>
          <TableHead>Address</TableHead>
          <TableHead>Tax ID</TableHead>
          <TableHead>Members</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((organization) => (
          <TableRow
            key={organization.id}
            className="group transition-colors hover:bg-muted/50"
          >
            <TableCell className="font-medium">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background text-primary shadow-xs">
                  <Building2 className="size-4" />
                </div>
                <span className="truncate text-foreground">
                  <Link
                    to="/app/organizations/$organizationId"
                    params={{ organizationId: organization.id }}
                    className="rounded-sm outline-none hover:text-primary hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/25"
                  >
                    {organization.name}
                  </Link>
                </span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate">{organization.address}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Hash className="h-4 w-4 shrink-0" />
                <span className="truncate">{organization.taxId}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4 shrink-0" />
                <span>{organization.members.length}</span>
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
                  <DropdownMenuItem asChild>
                    <Link
                      to="/app/organizations/$organizationId"
                      params={{ organizationId: organization.id }}
                    >
                      <SquareArrowOutUpRight className="mr-2 h-4 w-4" />
                      View details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(organization)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
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
