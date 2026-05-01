"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X } from "lucide-react";
import type { ProductCategory } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PRODUCT_CATEGORY_LABELS, STACK_SUGGESTIONS } from "@/constants";
import { cn } from "@/lib/utils";
import { useUpload } from "@/hooks/use-upload";
import type { ActionResult } from "@/types";

interface InitialData {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string | null;
  category: ProductCategory;
  stacks: string[];
  repositoryUrl?: string | null;
  productUrl?: string | null;
  note?: string | null;
  iconUrl?: string | null;
  themeColor?: string | null;
  sortOrder: number;
  isPublic: boolean;
}

interface ProductSettingsFormProps {
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  initialData: InitialData;
  existingStacks: string[];
  cancelHref: string;
  productName: string;
  taskCount: number;
  imageCount: number;
  releaseCount: number;
}

function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-[11px] font-medium text-muted-foreground uppercase tracking-wide", className)}>
      {children}
    </p>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">{children}</p>
  );
}

function FieldError({ message }: { message: string | undefined }) {
  if (!message) return null;
  return <p className="text-xs text-red-500 mt-1">{message}</p>;
}

function extractGithubPath(url: string | null | undefined): string {
  if (!url) return "";
  const match = url.match(/^https?:\/\/github\.com\/(.+)$/);
  return match ? match[1] : url;
}

export function ProductSettingsForm({
  action,
  initialData,
  existingStacks,
  cancelHref,
  productName,
  taskCount,
  imageCount,
  releaseCount,
}: ProductSettingsFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const [category, setCategory] = useState<string>(initialData.category ?? "");
  const [stacks, setStacks] = useState<string[]>(initialData.stacks ?? []);
  const [stackInput, setStackInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isPublic, setIsPublic] = useState(initialData.isPublic ?? false);
  const [iconUrl, setIconUrl] = useState<string>(initialData.iconUrl ?? "");
  const [themeColor, setThemeColor] = useState<string>(initialData.themeColor || "#6366F1");
  const [noThemeColor, setNoThemeColor] = useState(!initialData.themeColor);
  const [iconUploading, setIconUploading] = useState(false);
  const [repoPath, setRepoPath] = useState<string>(extractGithubPath(initialData.repositoryUrl));
  const { upload } = useUpload();

  useEffect(() => {
    if (state?.success === false && state.error) {
      toast.error(state.error);
    }
  }, [state]);

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIconUploading(true);
    const result = await upload(file, initialData.id, "icon");
    if (result) setIconUrl(result.url);
    setIconUploading(false);
  };

  const addStack = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !stacks.includes(trimmed)) {
      setStacks((prev) => [...prev, trimmed]);
    }
    setStackInput("");
    setShowSuggestions(false);
  };

  const removeStack = (stack: string) => {
    setStacks((prev) => prev.filter((s) => s !== stack));
  };

  const allSuggestions = [...new Set([...STACK_SUGGESTIONS, ...existingStacks])];
  const filteredSuggestions = allSuggestions.filter(
    (s) => s.toLowerCase().includes(stackInput.toLowerCase()) && !stacks.includes(s)
  );

  const fieldError = (field: string) => state?.fieldErrors?.[field]?.[0];
  const repositoryUrl = repoPath ? `https://github.com/${repoPath}` : "";

  return (
    <>
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>編集を破棄しますか？</AlertDialogTitle>
            <AlertDialogDescription>保存していない変更はすべて失われます。本当にキャンセルしますか？</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>戻る</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => router.push(cancelHref)}
            >
              破棄して戻る
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <form action={formAction}>
        {/* Hidden inputs */}
        <input type="hidden" name="category" value={category} />
        {stacks.map((stack) => (
          <input key={stack} type="hidden" name="stacks" value={stack} />
        ))}
        <input type="hidden" name="isPublic" value={isPublic ? "true" : "false"} />
        <input type="hidden" name="iconUrl" value={iconUrl} />
        <input type="hidden" name="themeColor" value={noThemeColor ? "" : themeColor} />
        <input type="hidden" name="sortOrder" value={initialData.sortOrder ?? 0} />
        <input type="hidden" name="repositoryUrl" value={repositoryUrl} />

        {/* Action bar */}
        <div className="flex items-center justify-between mb-5 pb-4 border-b">
          <h2 className="text-base font-semibold">{productName} — 設定</h2>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setShowCancelConfirm(true)}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "保存中..." : "保存"}
            </Button>
          </div>
        </div>

        {/* 2-column layout */}
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_300px] gap-5">
          {/* Main column */}
          <div className="space-y-4">
            {/* 基本情報 card */}
            <div className="bg-background border rounded-lg p-5 space-y-4">
              <SectionLabel>基本情報</SectionLabel>

              {/* Name (col-span-2) + Slug — 3-col grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <FieldLabel>
                    プロダクト名 <span className="text-red-400 normal-case">*</span>
                  </FieldLabel>
                  <Input name="name" defaultValue={initialData.name} />
                  <FieldError message={fieldError("name")} />
                </div>
                <div>
                  <FieldLabel>
                    スラッグ <span className="text-red-400 normal-case">*</span>
                  </FieldLabel>
                  <Input name="slug" defaultValue={initialData.slug} placeholder="my-product" />
                  <FieldError message={fieldError("slug")} />
                </div>
              </div>

              {/* Description + Category — horizontal */}
              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <FieldLabel>
                    概要説明 <span className="text-red-400 normal-case">*</span>
                  </FieldLabel>
                  <Input name="description" defaultValue={initialData.description} placeholder="例: 日々のタスク管理に特化したWebアプリ" />
                  <p className="text-xs text-muted-foreground mt-1">1〜2文・40〜80字目安。カード一覧やブログの説明文に使用。</p>
                  <FieldError message={fieldError("description")} />
                </div>
                <div className="w-[150px]">
                  <FieldLabel>
                    カテゴリ <span className="text-red-400 normal-case">*</span>
                  </FieldLabel>
                  <Select value={category} onValueChange={(value) => setCategory(value ?? "")}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="選択">
                        {category ? PRODUCT_CATEGORY_LABELS[category as ProductCategory] : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(PRODUCT_CATEGORY_LABELS) as [ProductCategory, string][]).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError message={fieldError("category")} />
                </div>
              </div>

              {/* Long Description */}
              <div>
                <FieldLabel>詳細説明</FieldLabel>
                <Textarea
                  name="longDescription"
                  rows={6}
                  defaultValue={initialData.longDescription ?? ""}
                  placeholder="プロダクトの背景・コンセプト・主な機能などを自由に記述"
                />
                <p className="text-xs text-muted-foreground mt-1">200〜600字目安。ブログのプロダクト詳細ページに掲載する紹介文。</p>
              </div>
            </div>

            {/* 技術スタック card */}
            <div className="bg-background border rounded-lg p-5 space-y-3">
              <SectionLabel>技術スタック</SectionLabel>
              {stacks.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {stacks.map((stack) => (
                    <Badge key={stack} variant="secondary" className="gap-1 pr-1">
                      {stack}
                      <button type="button" onClick={() => removeStack(stack)} className="hover:text-destructive ml-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <div className="relative">
                <Input
                  value={stackInput}
                  onChange={(e) => {
                    setStackInput(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addStack(stackInput);
                    }
                  }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="技術名を入力してEnterで追加"
                />
                {showSuggestions && stackInput && filteredSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-md max-h-40 overflow-y-auto">
                    {filteredSuggestions.slice(0, 8).map((s) => (
                      <button key={s} type="button" className="w-full text-left px-3 py-1.5 hover:bg-muted text-sm" onMouseDown={() => addStack(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* リンク card */}
            <div className="bg-background border rounded-lg p-5 space-y-4">
              <SectionLabel>リンク</SectionLabel>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>リポジトリ</FieldLabel>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-xs whitespace-nowrap">
                      github.com/
                    </span>
                    <Input
                      value={repoPath}
                      onChange={(e) => setRepoPath(e.target.value)}
                      placeholder="user/repo"
                      className="rounded-l-none"
                    />
                  </div>
                  <FieldError message={fieldError("repositoryUrl")} />
                </div>
                <div>
                  <FieldLabel>プロダクトURL</FieldLabel>
                  <Input name="productUrl" type="url" defaultValue={initialData.productUrl ?? ""} placeholder="https://..." />
                  <FieldError message={fieldError("productUrl")} />
                </div>
              </div>
            </div>

            {/* 備考 card */}
            <div className="bg-background border rounded-lg p-5 space-y-3">
              <div className="flex items-center gap-2">
                <SectionLabel>備考</SectionLabel>
                <Badge variant="outline" className="text-[10px] py-0 h-4">
                  管理者のみ・ブログ非表示
                </Badge>
              </div>
              <Textarea
                name="note"
                rows={4}
                defaultValue={initialData.note ?? ""}
                placeholder="例: Vercel（個人アカウント）、Supabase（Free プラン）、ドメイン: example.com"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
            {/* 外観 card */}
            <div className="bg-background border rounded-lg p-5 space-y-4">
              <SectionLabel>外観</SectionLabel>

              <div>
                <FieldLabel>アイコン</FieldLabel>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg border border-border overflow-hidden bg-muted flex items-center justify-center shrink-0">
                    {iconUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={iconUrl} alt="icon" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-muted-foreground text-xs">なし</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label
                      className={cn(
                        "cursor-pointer text-xs px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors",
                        iconUploading && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {iconUploading ? "アップロード中..." : "変更"}
                      <input type="file" accept="image/*" className="hidden" disabled={iconUploading} onChange={handleIconUpload} />
                    </label>
                    {iconUrl && (
                      <button
                        type="button"
                        onClick={() => setIconUrl("")}
                        className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-muted text-muted-foreground transition-colors text-left"
                      >
                        削除
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <FieldLabel>テーマカラー</FieldLabel>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="noThemeColor"
                      checked={noThemeColor}
                      onChange={(e) => setNoThemeColor(e.target.checked)}
                      className="size-4 rounded"
                    />
                    <label htmlFor="noThemeColor" className="text-sm cursor-pointer">なし</label>
                  </div>
                  {!noThemeColor && (
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={themeColor}
                        onChange={(e) => setThemeColor(e.target.value)}
                        className="size-8 rounded cursor-pointer border border-border"
                      />
                      <Input
                        value={themeColor}
                        onChange={(e) => setThemeColor(e.target.value)}
                        placeholder="#6366F1"
                        className="w-28 font-mono text-sm"
                        maxLength={7}
                      />
                      <div className="h-8 w-10 rounded-md border border-border" style={{ backgroundColor: themeColor }} />
                    </div>
                  )}
                </div>
                <FieldError message={fieldError("themeColor")} />
              </div>
            </div>

            {/* 公開設定 card */}
            <div className="bg-background border rounded-lg p-5 space-y-3">
              <SectionLabel>公開設定</SectionLabel>
              <div className="flex items-center gap-2.5">
                <Switch id="isPublic" checked={isPublic} onCheckedChange={setIsPublic} />
                <label htmlFor="isPublic" className="text-sm cursor-pointer">
                  ブログで公開する
                </label>
              </div>
            </div>

            {/* メタ情報 card */}
            <div className="bg-background border rounded-lg p-5 space-y-3">
              <SectionLabel>メタ情報</SectionLabel>
              <dl className="space-y-2">
                <div className="flex justify-between text-sm">
                  <dt className="text-muted-foreground">リリースノート</dt>
                  <dd className="font-medium">{releaseCount}件</dd>
                </div>
                <div className="flex justify-between text-sm">
                  <dt className="text-muted-foreground">画像</dt>
                  <dd className="font-medium">{imageCount}枚</dd>
                </div>
                <div className="flex justify-between text-sm">
                  <dt className="text-muted-foreground">タスク</dt>
                  <dd className="font-medium">{taskCount}件</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
