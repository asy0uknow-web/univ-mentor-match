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

export const CATEGORY_ICONS: Record<string, { icon: LucideIcon; color: string; label: string }> = {
  "입시 전략": {
    icon: GraduationCap,
    color: "text-blue-600 dark:text-blue-400",
    label: "입시 전략",
  },
  "전공 선택": {
    icon: BookOpen,
    color: "text-purple-600 dark:text-purple-400",
    label: "전공 선택",
  },
  "대학 생활": {
    icon: Home,
    color: "text-green-600 dark:text-green-400",
    label: "대학 생활",
  },
  "학교 분위기": {
    icon: Users,
    color: "text-orange-600 dark:text-orange-400",
    label: "학교 분위기",
  },
  "학업/생기부": {
    icon: Briefcase,
    color: "text-red-600 dark:text-red-400",
    label: "학업/생기부",
  },
  "기숙사/통학": {
    icon: MapPin,
    color: "text-cyan-600 dark:text-cyan-400",
    label: "기숙사/통학",
  },
  "인간관계/적응": {
    icon: Users,
    color: "text-pink-600 dark:text-pink-400",
    label: "인간관계/적응",
  },
  "진로 고민": {
    icon: Lightbulb,
    color: "text-yellow-600 dark:text-yellow-400",
    label: "진로 고민",
  },
  "기타": {
    icon: HelpCircle,
    color: "text-gray-600 dark:text-gray-400",
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

export function getCategoryIconComponent(category?: string | null) {
  return getCategoryIcon(category).icon;
}
