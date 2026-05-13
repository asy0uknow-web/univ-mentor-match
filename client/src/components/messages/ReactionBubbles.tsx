import { memo, useCallback } from "react";

interface ReactionBubblesProps {
  reactions: any[];
  currentUserId: number;
  messageId: number;
  onToggle: (emoji: string) => void;
}

export const ReactionBubbles = memo(function ReactionBubbles({
  reactions,
  currentUserId,
  messageId,
  onToggle,
}: ReactionBubblesProps) {
  if (!reactions || reactions.length === 0) return null;

  const grouped = reactions.reduce(
    (acc: Record<string, { count: number; users: number[] }>, r: any) => {
      if (!acc[r.emoji]) acc[r.emoji] = { count: 0, users: [] };
      acc[r.emoji].count++;
      acc[r.emoji].users.push(r.userId);
      return acc;
    },
    {}
  );

  const handleToggle = useCallback(
    (emoji: string) => {
      onToggle(emoji);
    },
    [onToggle]
  );

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {Object.entries(grouped).map(([emoji, { count, users }]) => {
        const isMyReaction = users.includes(currentUserId);
        return (
          <button
            key={emoji}
            onClick={() => handleToggle(emoji)}
            className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs border transition-all ${
              isMyReaction
                ? "bg-[var(--brand-primary-50)] border-[var(--brand-primary-700)]/30 text-[var(--brand-primary-700)]"
                : "bg-[var(--color-bg-card)] border-[var(--color-border-default)] hover:bg-[var(--color-bg-card)]"
            }`}
          >
            <span>{emoji}</span>
            <span className="font-medium">{count}</span>
          </button>
        );
      })}
    </div>
  );
});

ReactionBubbles.displayName = "ReactionBubbles";
