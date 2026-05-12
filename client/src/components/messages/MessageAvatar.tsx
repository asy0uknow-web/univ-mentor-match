import { memo } from "react";

interface MessageAvatarProps {
  name: string;
  profileImageUrl?: string | null;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-7 h-7 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-12 h-12 text-base",
};

const colors = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-indigo-500",
];

export const MessageAvatar = memo(function MessageAvatar({
  name,
  profileImageUrl,
  size = "md",
}: MessageAvatarProps) {
  const sizeClass = sizeClasses[size];
  const initial = name ? name.charAt(0) : "?";
  const colorIdx = name ? name.charCodeAt(0) % colors.length : 0;

  if (profileImageUrl) {
    return (
      <div className={`${sizeClass} rounded-full overflow-hidden shrink-0`}>
        <img
          src={profileImageUrl}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full ${colors[colorIdx]} text-white flex items-center justify-center font-semibold shrink-0`}
    >
      {initial}
    </div>
  );
});

MessageAvatar.displayName = "MessageAvatar";
