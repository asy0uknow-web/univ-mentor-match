import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface ConsultationCTAButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ConsultationCTAButton({
  label,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
}: ConsultationCTAButtonProps) {
  const baseClass = "group transition-all duration-300 ease-out";
  
  const variantClass = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-lg hover:-translate-y-1",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-900 hover:shadow-md dark:shadow-lg hover:-translate-y-0.5",
    outline: "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 hover:shadow-md dark:shadow-lg hover:-translate-y-0.5",
  };

  const sizeClass = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <Button
      onClick={onClick}
      className={`${baseClass} ${variantClass[variant]} ${sizeClass[size]} ${className} flex items-center gap-2`}
    >
      {label}
      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
    </Button>
  );
}
