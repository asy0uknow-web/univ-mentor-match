import { memo } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { ko } from "date-fns/locale";

interface DateDividerProps {
  date: Date;
}

export const DateDivider = memo(function DateDivider({
  date,
}: DateDividerProps) {
  let label = "";
  if (isToday(date)) label = "오늘";
  else if (isYesterday(date)) label = "어제";
  else label = format(date, "yyyy년 M월 d일 (E)", { locale: ko });

  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-[var(--color-border-default)]" />
      <span className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-bg-card)] px-2 whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-[var(--color-border-default)]" />
    </div>
  );
});

DateDivider.displayName = "DateDivider";
