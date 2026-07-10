import { LaptopIcon, MoonIcon, SunIcon } from 'lucide-react';

import { useTheme } from '#/hooks/use-theme';
import { Button } from '#/components/ui/button';

export default function ThemeToggle({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { mode, toggleThemeMode } = useTheme();

  const label =
    mode === 'auto'
      ? 'Motyw automatyczny. Kliknij, aby przełączyć na jasny.'
      : `Motyw: ${mode === 'dark' ? 'ciemny' : 'jasny'}. Kliknij, aby przełączyć.`;

  const Icon =
    mode === 'auto' ? LaptopIcon : mode === 'dark' ? MoonIcon : SunIcon;
  const text = mode === 'auto' ? 'Auto' : mode === 'dark' ? 'Ciemny' : 'Jasny';

  return (
    <Button
      type="button"
      variant="outline"
      size={compact ? 'icon-sm' : 'sm'}
      onClick={toggleThemeMode}
      aria-label={label}
      title={label}
      className="border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--sea-ink)] shadow-xs"
    >
      <Icon aria-hidden="true" />
      <span className={compact ? 'sr-only' : undefined}>{text}</span>
    </Button>
  );
}
