import type { ProductStatus, ProductCategory, ReleaseType, DevTaskType, DevTaskStatus, Priority } from "@prisma/client";

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  IDEA: "構想中",
  DEVELOPING: "開発中",
  RELEASED: "リリース済",
  MAINTENANCE: "メンテナンス",
  PAUSED: "休止中",
};

export const PRODUCT_STATUS_COLORS: Record<ProductStatus, string> = {
  IDEA: "bg-slate-100 text-slate-700",
  DEVELOPING: "bg-blue-100 text-blue-700",
  RELEASED: "bg-green-100 text-green-700",
  MAINTENANCE: "bg-yellow-100 text-yellow-700",
  PAUSED: "bg-red-100 text-red-700",
};

export const PRODUCT_STATUS_DOT_COLORS: Record<ProductStatus, string> = {
  IDEA: "bg-slate-400",
  DEVELOPING: "bg-blue-500",
  RELEASED: "bg-green-500",
  MAINTENANCE: "bg-yellow-500",
  PAUSED: "bg-red-500",
};

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  APP: "アプリ",
  MCP: "MCP",
  SITE: "サイト",
};

export const PRODUCT_CATEGORY_COLORS: Record<ProductCategory, string> = {
  APP: "bg-purple-100 text-purple-700",
  MCP: "bg-orange-100 text-orange-700",
  SITE: "bg-cyan-100 text-cyan-700",
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
