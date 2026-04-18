import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

type Variant = "primary" | "secondary" | "outline";

interface ConsultationCTAButtonProps {
  variant?: Variant;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
  size?: "sm" | "default" | "lg";
  disabled?: boolean;
}

const VARIANT_CONFIG: Record<Variant, { className: string; icon: boolean }> = {
  primary: {
    className: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-1",
    icon: true,
  },
  secondary: {
    className: "bg-slate-200 hover:bg-slate-300 text-foreground shadow-lg hover:shadow-xl hover:-translate-y-1",
    icon: true,
  },
  outline: {
    className: "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50",
    icon: true,
  },
};

export function ConsultationCTAButton({
  variant = "primary",
  onClick,
  className = "",
  children = "상담 문의",
  size = "default",
  disabled = false,
}: ConsultationCTAButtonProps) {
  const config = VARIANT_CONFIG[variant];

  return (
    <Button
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={`${config.className} transition-all duration-300 ${className}`}
    >
      {config.icon && <MessageCircle className="h-4 w-4 mr-2" />}
      {children}
    </Button>
  );
}
