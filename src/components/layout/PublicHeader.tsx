import { ThemeToggle } from '@/components/shared/ThemeToggle';

export function PublicHeader() {
  return (
    <header className="h-14 px-4 flex items-center justify-end border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <ThemeToggle size="icon" variant="ghost" />
    </header>
  );
}
