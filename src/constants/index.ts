import type { ProductStatus, ProductCategory, ReleaseType, DevTaskType, DevTaskStatus, Priority, DeviceType } from "@prisma/client";

export const PRODUCT_STATUS_VALUES: readonly [ProductStatus, ...ProductStatus[]] = ["IDEA", "DEVELOPING", "RELEASED", "MAINTENANCE", "PAUSED"];

export const PRODUCT_CATEGORY_VALUES: readonly [ProductCategory, ...ProductCategory[]] = ["APP", "MCP", "SITE", "EXTENSION", "LIBRARY"];

export const RELEASE_TYPE_VALUES: readonly [ReleaseType, ...ReleaseType[]] = ["MAJOR", "MINOR", "PATCH", "HOTFIX"];

export const DEV_TASK_TYPE_VALUES: readonly [DevTaskType, ...DevTaskType[]] = ["FEATURE", "BUG", "IMPROVEMENT"];

export const DEV_TASK_STATUS_VALUES: readonly [DevTaskStatus, ...DevTaskStatus[]] = ["TODO", "IN_PROGRESS", "DONE", "ON_HOLD"];

export const PRIORITY_VALUES: readonly [Priority, ...Priority[]] = ["HIGH", "MEDIUM", "LOW"];

export const PRODUCT_SORT_OPTIONS = [
  { value: "sortOrder", label: "表示順" },
  { value: "updatedAt", label: "更新日順" },
  { value: "name", label: "名前順" },
  { value: "releaseDate", label: "リリース日順" },
  { value: "latestRelease", label: "最新リリース順" },
] as const;

export type ProductSortKey = (typeof PRODUCT_SORT_OPTIONS)[number]["value"];

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  IDEA: "構想中",
  DEVELOPING: "開発中",
  RELEASED: "リリース済",
  MAINTENANCE: "メンテナンス",
  PAUSED: "休止中",
};

export const PRODUCT_STATUS_COLORS: Record<ProductStatus, string> = {
  IDEA: "bg-gray-100 text-gray-600",
  DEVELOPING: "bg-blue-50 text-blue-800",
  RELEASED: "bg-green-50 text-green-800",
  MAINTENANCE: "bg-teal-50 text-teal-800",
  PAUSED: "bg-amber-50 text-amber-800",
};

export const PRODUCT_STATUS_DOT_COLORS: Record<ProductStatus, string> = {
  IDEA: "bg-gray-400",
  DEVELOPING: "bg-blue-500",
  RELEASED: "bg-green-500",
  MAINTENANCE: "bg-teal-500",
  PAUSED: "bg-amber-500",
};

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  APP: "アプリ",
  MCP: "MCP",
  SITE: "サイト",
  EXTENSION: "拡張機能",
  LIBRARY: "ライブラリ",
};

export const PRODUCT_CATEGORY_COLORS: Record<ProductCategory, string> = {
  APP: "bg-blue-50 text-blue-800",
  MCP: "bg-purple-50 text-purple-800",
  SITE: "bg-green-50 text-green-800",
  EXTENSION: "bg-orange-50 text-orange-800",
  LIBRARY: "bg-gray-100 text-gray-700",
};

export const RELEASE_TYPE_LABELS: Record<ReleaseType, string> = {
  MAJOR: "メジャー",
  MINOR: "マイナー",
  PATCH: "パッチ",
  HOTFIX: "ホットフィックス",
};

export const RELEASE_TYPE_COLORS: Record<ReleaseType, string> = {
  MAJOR: "bg-red-100 text-red-700",
  MINOR: "bg-blue-100 text-blue-700",
  PATCH: "bg-green-100 text-green-700",
  HOTFIX: "bg-yellow-100 text-yellow-700",
};

export const DEV_TASK_TYPE_LABELS: Record<DevTaskType, string> = {
  FEATURE: "機能追加",
  BUG: "バグ修正",
  IMPROVEMENT: "改善",
};

export const DEV_TASK_TYPE_COLORS: Record<DevTaskType, string> = {
  FEATURE: "bg-blue-100 text-blue-700",
  BUG: "bg-red-100 text-red-700",
  IMPROVEMENT: "bg-green-100 text-green-700",
};

export const DEV_TASK_STATUS_LABELS: Record<DevTaskStatus, string> = {
  TODO: "未着手",
  IN_PROGRESS: "進行中",
  DONE: "完了",
  ON_HOLD: "保留",
};

export const DEV_TASK_STATUS_COLORS: Record<DevTaskStatus, string> = {
  TODO: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  DONE: "bg-green-100 text-green-700",
  ON_HOLD: "bg-yellow-100 text-yellow-700",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  HIGH: "高",
  MEDIUM: "中",
  LOW: "低",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW: "bg-slate-100 text-slate-700",
};

export const DEVICE_TYPE_LABELS: Record<DeviceType, string> = {
  PC: "PC",
  MOBILE: "Mobile",
  OTHER: "Other",
};

export const DEVICE_TYPE_COLORS: Record<DeviceType, string> = {
  PC: "bg-slate-100 text-slate-700 border-slate-200",
  MOBILE: "bg-blue-50 text-blue-700 border-blue-200",
  OTHER: "bg-slate-100 text-slate-700 border-slate-200",
};

export const DEVICE_TYPE_ORDER: DeviceType[] = ["PC", "MOBILE", "OTHER"];

export const STACK_SUGGESTIONS = [
  "Next.js",
  "React",
  "TypeScript",
  "JavaScript",
  "Supabase",
  "Prisma",
  "Tailwind CSS",
  "shadcn/ui",
  "Better Auth",
  "Vercel",
  "Node.js",
  "Python",
  "PostgreSQL",
  "SQLite",
  "Redis",
];
