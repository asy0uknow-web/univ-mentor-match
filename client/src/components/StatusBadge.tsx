import { Badge } from "@/components/ui/badge";

type StatusType = "pending" | "answered" | "solved" | "confirmed" | "completed" | "warning" | "danger" | "new" | "popular" | "accepted";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const STATUS_CONFIG: Record<StatusType, { label: string; className: string }> = {
  // Q&A 상태
  pending: {
    label: "답변대기",
    className: "bg-[var(--color-status-pending-bg)] text-[var(--color-status-pending-text)] border-[var(--brand-accent-300)] dark:border-[var(--brand-accent-700)]",
  },
  answered: {
    label: "답변완료",
    className: "bg-[var(--color-status-answered-bg)] text-[var(--color-status-answered-text)] border-[var(--brand-primary-300)] dark:border-[var(--brand-primary-700)]",
  },
  solved: {
    label: "해결됨",
    className: "bg-[var(--color-status-solved-bg)] text-[var(--color-status-solved-text)] border-[var(--brand-secondary-300)] dark:border-[var(--brand-secondary-700)]",
  },
  
  // 상담 상태
  confirmed: {
    label: "약속확정",
    className: "bg-[var(--color-status-confirmed-bg)] text-[var(--color-status-confirmed-text)] border-[var(--brand-secondary-300)] dark:border-[var(--brand-secondary-700)]",
  },
  completed: {
    label: "완료됨",
    className: "bg-[var(--color-status-completed-bg)] text-[var(--color-status-completed-text)] border-[var(--brand-secondary-300)] dark:border-[var(--brand-secondary-700)]",
  },
  warning: {
    label: "일정변경요청",
    className: "bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-text)] border-[var(--brand-accent-300)] dark:border-[var(--brand-accent-700)]",
  },
  danger: {
    label: "취소됨",
    className: "bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger-text)] border-[#FECACA] dark:border-[#7F1D1D]",
  },
  
  // 호환성 (기존 코드)
  accepted: {
    label: "진행중",
    className: "bg-[var(--color-status-answered-bg)] text-[var(--color-status-answered-text)] border-[var(--brand-primary-300)] dark:border-[var(--brand-primary-700)]",
  },
  
  // 기타 상태
  new: {
    label: "새로운",
    className: "bg-[var(--brand-primary-50)] text-[var(--brand-primary-700)] border-[var(--brand-primary-200)] dark:bg-[var(--brand-primary-900)] dark:text-[var(--brand-primary-300)] dark:border-[var(--brand-primary-700)]",
  },
  popular: {
    label: "인기",
    className: "bg-[var(--brand-accent-50)] text-[var(--brand-accent-700)] border-[var(--brand-accent-200)] dark:bg-[var(--brand-accent-900)] dark:text-[var(--brand-accent-300)] dark:border-[var(--brand-accent-700)]",
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
