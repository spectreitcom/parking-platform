import type { AdminListItemSchema } from '#/features/admins/schemas';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table.tsx';
import { Mail, MoreHorizontal, Circle } from 'lucide-react';
import { Button } from '#/components/ui/button.tsx';
import { cn } from '#/lib/utils';

type Props = Readonly<{
  items: AdminListItemSchema[];
}>;

const statusStyles: Record<string, string> = {
  Active:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  Suspended:
    'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
  Invited:
    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
  Created:
    'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
};

export function AdminUsersList({ items }: Props) {
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
        {items.map((admin) => (
          <TableRow
            key={admin.id}
            className="group transition-colors hover:bg-muted/50"
          >
            <TableCell className="font-medium">
              <span className="truncate">{admin.displayName}</span>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate">{admin.email}</span>
              </div>
            </TableCell>
            <TableCell>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border',
                  statusStyles[admin.statusText] ||
                    'bg-secondary text-secondary-foreground',
                )}
              >
                <Circle
                  className={cn(
                    'h-1.5 w-1.5 fill-current',
                    !statusStyles[admin.statusText] && 'text-muted-foreground',
                  )}
                />
                {admin.statusText}
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
