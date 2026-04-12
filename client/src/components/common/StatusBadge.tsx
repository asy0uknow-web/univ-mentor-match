interface StatusBadgeProps {
  status: "pending" | "accepted" | "rejected" | "completed" | "new" | "popular";
  label: string;
  className?: string;
}

export function StatusBadge({ status, label, className = "" }: StatusBadgeProps) {
  const statusClass = {
    pending: "bg-yellow-100 text-yellow-800 border border-yellow-300",
    accepted: "bg-green-100 text-green-800 border border-green-300",
    rejected: "bg-red-100 text-red-800 border border-red-300",
    completed: "bg-blue-100 text-blue-800 border border-blue-300",
    new: "bg-indigo-100 text-indigo-800 border border-indigo-300",
    popular: "bg-orange-100 text-orange-800 border border-orange-300",
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusClass[status]} ${className}`}>
      {label}
    </span>
  );
}
