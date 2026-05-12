import { memo } from "react";

interface TypingIndicatorProps {
  name: string;
}

export const TypingIndicator = memo(function TypingIndicator({
  name,
}: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex gap-1 items-center bg-[var(--color-bg-card)] rounded-2xl px-3 py-2 border border-[var(--color-border-default)]">
        <span className="text-xs text-[var(--color-text-secondary)] mr-1">
          {name}님이 입력 중
        </span>
        <span className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 bg-[var(--color-text-secondary)]/60 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </span>
      </div>
    </div>
  );
});

TypingIndicator.displayName = "TypingIndicator";
