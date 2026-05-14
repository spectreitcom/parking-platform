import type { OrganizationUserListItemSchema } from '#/features/organization-users/schemas';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table.tsx';
import { Button } from '#/components/ui/button.tsx';
import { StatusBadge } from '#/components/status-badge';
import { Mail, MoreHorizontal, UserRound } from 'lucide-react';

type Props = Readonly<{
  items: OrganizationUserListItemSchema[];
}>;

const statusTone: Record<string, 'positive' | 'negative' | 'info' | 'neutral'> =
  {
    Active: 'positive',
    Suspended: 'negative',
    Invited: 'info',
    Created: 'neutral',
  };

export function OrganizationUsersList({ items }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[250px]">Display Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((organizationUser) => (
          <TableRow
            key={organizationUser.organizationUserId}
            className="group transition-colors hover:bg-muted/50"
          >
            <TableCell className="font-medium">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background text-primary shadow-xs">
                  <UserRound className="size-4" />
                </div>
                <span className="truncate text-foreground">
                  {organizationUser.displayName}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate">{organizationUser.email}</span>
              </div>
            </TableCell>
            <TableCell>
              <StatusBadge
                tone={statusTone[organizationUser.statusText] ?? 'neutral'}
              >
                {organizationUser.statusText}
              </StatusBadge>
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
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
