import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '#/components/ui/button';

type Props = Readonly<{
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}>;

export function Pagination({ total, page, pageSize, onPageChange }: Props) {
  if (pageSize <= 0) return;
  const totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        <ChevronLeft className="size-4" />
      </Button>
      <span className="min-w-20 text-center text-sm font-medium text-muted-foreground">
        {page} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
