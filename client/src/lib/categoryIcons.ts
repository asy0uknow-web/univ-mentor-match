import {
  GraduationCap,
  BookOpen,
  Home,
  Users,
  Briefcase,
  Lightbulb,
  MapPin,
  HelpCircle,
  LucideIcon,
} from "lucide-react";

export const CATEGORY_ICONS: Record<string, { icon: LucideIcon; color: string; bgColor: string; label: string }> = {
  "입시 전략": {
    icon: GraduationCap,
    color: "text-white",
    bgColor: "bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700",
    label: "입시 전략",
  },
  "전공 선택": {
    icon: BookOpen,
    color: "text-white",
    bgColor: "bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700",
    label: "전공 선택",
  },
  "대학 생활": {
    icon: Home,
    color: "text-white",
    bgColor: "bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700",
    label: "대학 생활",
  },
  "학교 분위기": {
    icon: Users,
    color: "text-white",
    bgColor: "bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700",
    label: "학교 분위기",
  },
  "학업/생기부": {
    icon: Briefcase,
    color: "text-white",
    bgColor: "bg-gradient-to-br from-red-500 to-red-600 dark:from-red-600 dark:to-red-700",
    label: "학업/생기부",
  },
  "기숙사/통학": {
    icon: MapPin,
    color: "text-white",
    bgColor: "bg-gradient-to-br from-cyan-500 to-cyan-600 dark:from-cyan-600 dark:to-cyan-700",
    label: "기숙사/통학",
  },
  "인간관계/적응": {
    icon: Users,
    color: "text-white",
    bgColor: "bg-gradient-to-br from-pink-500 to-pink-600 dark:from-pink-600 dark:to-pink-700",
    label: "인간관계/적응",
  },
  "진로 고민": {
    icon: Lightbulb,
    color: "text-white",
    bgColor: "bg-gradient-to-br from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700",
    label: "진로 고민",
  },
  "기타": {
    icon: HelpCircle,
    color: "text-white",
    bgColor: "bg-gradient-to-br from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700",
    label: "기타",
  },
};

export function getCategoryIcon(category?: string | null) {
  if (!category) {
    return CATEGORY_ICONS["기타"];
  }
  return CATEGORY_ICONS[category] || CATEGORY_ICONS["기타"];
}

export function getCategoryColor(category?: string | null): string {
  return getCategoryIcon(category).color;
}

export function getCategoryBgColor(category?: string | null): string {
  return getCategoryIcon(category).bgColor;
}

export function getCategoryIconComponent(category?: string | null) {
  return getCategoryIcon(category).icon;
}
