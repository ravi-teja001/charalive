import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FormCardProps {
  title: string | ReactNode;
  description?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function FormCard({ title, description, children, className, action }: FormCardProps) {
  return (
    <div className={cn("bg-card border border-border rounded-2xl shadow-lg p-6 lg:p-8", className)}>
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1">
          <h2 className="font-display text-xl font-semibold text-card-foreground">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {action && (
          <div className="flex gap-2 flex-shrink-0">
            {action}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
