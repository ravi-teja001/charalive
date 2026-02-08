import * as React from 'react';
import { ChevronLeft, ChevronRight, Truck } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday } from 'date-fns';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export interface CalendarEvent {
  trips?: number;
  netWeight?: number;
  [key: string]: unknown;
}

interface EventCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  events?: { [date: string]: CalendarEvent };
  className?: string;
  showTodayButton?: boolean;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function EventCalendar({
  selectedDate,
  onDateSelect,
  events = {},
  className,
  showTodayButton = true,
}: EventCalendarProps) {
  const [viewDate, setViewDate] = React.useState(selectedDate);

  React.useEffect(() => {
    setViewDate(selectedDate);
  }, [selectedDate]);

  const handlePrevMonth = () => setViewDate((d) => subMonths(d, 1));
  const handleNextMonth = () => setViewDate((d) => addMonths(d, 1));
  const handleToday = () => {
    const today = new Date();
    setViewDate(today);
    onDateSelect(today);
  };

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const getEventForDate = (d: Date) => {
    const key = format(d, 'yyyy-MM-dd');
    return events[key];
  };

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Header: Month Year, Nav, Today */}
      <div className="flex items-center justify-between px-2">
        <h3 className="text-lg font-semibold text-foreground">
          {format(viewDate, 'MMMM yyyy')}
        </h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'h-8 w-8 rounded-md p-0 shrink-0 hover:bg-muted'
            )}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'h-8 w-8 rounded-md p-0 shrink-0 hover:bg-muted'
            )}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          {showTodayButton ? (
            <button
              type="button"
              onClick={handleToday}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'h-8 px-2 text-xs font-medium shrink-0 ml-1'
              )}
            >
              Today
            </button>
          ) : null}
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-0.5">
        {WEEKDAYS.map((wd) => (
          <div
            key={wd}
            className="py-1.5 text-center text-[0.7rem] font-medium text-muted-foreground"
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((d) => {
          const event = getEventForDate(d);
          const hasTrips = event && (event.trips ?? 0) > 0;
          const isSelected = isSameDay(d, selectedDate);
          const isCurrentMonth = isSameMonth(d, viewDate);
          const isCurrentDay = isToday(d);

          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => onDateSelect(d)}
              className={cn(
                'relative flex flex-col items-center min-h-[3.5rem] rounded-lg p-1.5 text-sm transition-colors',
                'hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                !isCurrentMonth && 'text-muted-foreground opacity-50',
                isSelected && 'bg-primary text-primary-foreground hover:bg-primary focus:ring-primary',
                isCurrentDay && !isSelected && 'bg-muted font-semibold'
              )}
            >
              <span className="text-sm font-medium">{format(d, 'd')}</span>
              {hasTrips && (
                <span
                  className={cn(
                    'mt-0.5 flex items-center gap-0.5 rounded px-1 py-0.5 text-[0.65rem] font-medium truncate max-w-full',
                    isSelected
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-primary/10 text-primary'
                  )}
                >
                  <Truck className="h-2.5 w-2.5 shrink-0" />
                  {event?.trips ?? 0} trip{(event?.trips ?? 0) !== 1 ? 's' : ''}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
