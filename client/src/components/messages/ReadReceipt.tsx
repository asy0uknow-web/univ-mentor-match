import { memo } from "react";
import { Check, CheckCheck } from "lucide-react";

interface ReadReceiptProps {
  isRead: boolean;
  isMe: boolean;
}

export const ReadReceipt = memo(function ReadReceipt({
  isRead,
  isMe,
}: ReadReceiptProps) {
  if (!isMe) return null;

  return (
    <span className="inline-flex items-center ml-1">
      {isRead ? (
        <CheckCheck className="h-3 w-3 text-[var(--brand-primary-700)]" />
      ) : (
        <Check className="h-3 w-3 text-[var(--color-text-secondary)]/60" />
      )}
    </span>
  );
});

ReadReceipt.displayName = "ReadReceipt";
