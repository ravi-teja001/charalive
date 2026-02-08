import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type AccentVariant = 'primary' | 'success' | 'blue' | 'emerald' | 'amber' | 'muted';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  accent?: AccentVariant;
  className?: string;
}

const accentStyles: Record<AccentVariant, string> = {
  primary: 'bg-primary/12 text-primary',
  success: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400',
  blue: 'bg-blue-500/12 text-blue-600 dark:text-blue-400',
  emerald: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400',
  amber: 'bg-amber-500/12 text-amber-600 dark:text-amber-400',
  muted: 'bg-muted/80 text-muted-foreground',
};

function isZeroValue(value: string | number): boolean {
  if (typeof value === 'number') return value === 0;
  const num = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  return isNaN(num) || num === 0;
}

export function StatCard({ title, value, subtitle, icon, trend, accent = 'primary', className }: StatCardProps) {
  const isZero = isZeroValue(value);
  const iconAccent = isZero ? 'muted' : accent;

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300',
        'hover:shadow-md hover:border-primary/20',
        isZero && 'opacity-90',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
          <p
            className={cn(
              'font-display text-2xl lg:text-3xl font-bold mt-2 tracking-tight',
              isZero ? 'text-muted-foreground' : 'text-foreground'
            )}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{subtitle}</p>
          )}
          {trend && (
            <div
              className={cn(
                'flex items-center gap-1 mt-2 text-sm font-medium',
                trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'
              )}
            >
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-muted-foreground font-normal">vs last week</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors',
            accentStyles[iconAccent]
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
