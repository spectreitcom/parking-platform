import type { UserItemSchema } from '#/features/users/schemas';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table.tsx';
import { BadgeCheck, Mail, MoreHorizontal, UserRound } from 'lucide-react';
import { Button } from '#/components/ui/button.tsx';

type Props = Readonly<{
  items: UserItemSchema[];
}>;

export function UsersList({ items }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[250px]">Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Provider</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((user) => (
          <TableRow
            key={user.id}
            className="group transition-colors hover:bg-muted/50"
          >
            <TableCell className="font-medium">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background text-primary shadow-xs">
                  <UserRound className="size-4" />
                </div>
                <span className="truncate text-foreground">{user.name}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2 text-muted-foreground">
                <BadgeCheck className="h-4 w-4 shrink-0" />
                <span className="truncate">{user.provider}</span>
              </div>
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
