import type { OrganizationListItemSchema } from '#/features/organizations/schemas';
import { EmptyState } from '#/components/page-shell.tsx';
import { Mail, MoreHorizontal, Trash2, UserRound, Users } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table.tsx';
import { StatusBadge } from '#/components/status-badge.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu.tsx';
import { Button } from '#/components/ui/button.tsx';

export function MembersTable({
  members,
  onRemoveMember,
}: Readonly<{
  members: OrganizationListItemSchema['members'];
  onRemoveMember: (
    member: OrganizationListItemSchema['members'][number],
  ) => void;
}>) {
  if (members.length === 0) {
    return (
      <EmptyState
        icon={<Users className="size-5" />}
        title="No members assigned"
        description="This organization does not have any assigned members yet."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[280px]">Member</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Organization User ID</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <TableRow
            key={member.id}
            className="group transition-colors hover:bg-muted/50"
          >
            <TableCell className="font-medium">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background text-primary shadow-xs">
                  <UserRound className="size-4" />
                </div>
                <span className="truncate text-foreground">
                  {member.displayName}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="size-4 shrink-0" />
                <span className="truncate">{member.email}</span>
              </div>
            </TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground">
              {member.organizationUserId}
            </TableCell>
            <TableCell>
              <StatusBadge tone={member.isRoot ? 'positive' : 'neutral'}>
                {member.isRoot ? 'Root' : 'Member'}
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
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => onRemoveMember(member)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
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
