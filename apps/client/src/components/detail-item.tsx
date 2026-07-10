import type { ReactNode } from 'react';

export function DetailItem({
  label,
  value,
  icon,
}: Readonly<{ label: string; value: string; icon: ReactNode }>) {
  return (
    <div className="metric-tile flex items-start gap-3">
      <span className="mt-0.5 text-primary [&_svg]:size-4">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="break-words font-semibold">{value}</p>
      </div>
    </div>
  );
}
