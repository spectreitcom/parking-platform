import { LaptopIcon, MoonIcon, SunIcon } from 'lucide-react';

import { useTheme } from '#/hooks/use-theme';
import { Button } from '#/components/ui/button';

export default function ThemeToggle() {
  const { mode, toggleThemeMode } = useTheme();

  const label =
    mode === 'auto'
      ? 'Theme mode: auto (system). Click to switch to light mode.'
      : `Theme mode: ${mode}. Click to switch mode.`;

  const Icon =
    mode === 'auto' ? LaptopIcon : mode === 'dark' ? MoonIcon : SunIcon;
  const text = mode === 'auto' ? 'Auto' : mode === 'dark' ? 'Dark' : 'Light';

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={toggleThemeMode}
      aria-label={label}
      title={label}
      className="border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--sea-ink)] shadow-xs"
    >
      <Icon aria-hidden="true" />
      <span>{text}</span>
    </Button>
  );
}
