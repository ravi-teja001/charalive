import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, showTodayButton = true, ...props }: CalendarProps) {
  const handleTodayClick = () => {
    const today = new Date();
    props.onSelect?.(today, today, {}, {} as React.MouseEvent);
  };

  return (
    <div className="flex flex-col gap-3">
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("p-4", className)}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-between items-center px-2 mb-3",
          caption_label: "text-base font-semibold text-foreground",
          nav: "flex items-center gap-1",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-8 w-8 rounded-md p-0 hover:bg-muted shrink-0"
          ),
          nav_button_previous: "absolute left-2",
          nav_button_next: "absolute right-2",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.75rem]",
          row: "flex w-full mt-2",
          cell: "h-9 w-9 text-center text-sm p-0 relative rounded-full [&:has([aria-selected])]:bg-transparent focus-within:relative focus-within:z-20",
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 font-normal rounded-full hover:bg-muted aria-selected:opacity-100"
          ),
          day_range_end: "day-range-end",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background",
          day_today: "bg-muted font-semibold",
          day_outside:
            "day-outside text-muted-foreground opacity-40 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
          day_disabled: "text-muted-foreground opacity-40",
          day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        components={{
          Chevron: ({ orientation }) =>
            orientation === "left" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />,
        }}
        {...props}
      />
      {showTodayButton && (
        <button
          type="button"
          onClick={handleTodayClick}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "w-full text-sm font-medium py-2"
          )}
        >
          Today
        </button>
      )}
    </div>
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
