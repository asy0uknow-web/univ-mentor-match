import { Badge } from "@/components/ui/badge";

type StatusType = "pending" | "accepted" | "rejected" | "completed" | "new" | "popular";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const STATUS_CONFIG: Record<StatusType, { label: string; className: string }> = {
  pending: {
    label: "대기 중",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  accepted: {
    label: "진행 중",
    className: "bg-blue-100 dark:bg-slate-800 text-blue-800 border-blue-200",
  },
  rejected: {
    label: "거절됨",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  completed: {
    label: "완료됨",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  new: {
    label: "새로운",
    className: "bg-purple-100 text-purple-800 border-purple-200",
  },
  popular: {
    label: "인기",
    className: "bg-orange-100 text-orange-800 border-orange-200",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  
  return (
    <Badge 
      variant="outline" 
      className={`text-xs flex-shrink-0 ${config.className} ${className || ""}`}
    >
      {config.label}
    </Badge>
  );
}
