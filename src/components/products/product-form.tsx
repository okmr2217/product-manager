"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import type { ProductCategory } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/lib/button-variants";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PRODUCT_CATEGORY_LABELS, STACK_SUGGESTIONS } from "@/constants";
import { cn } from "@/lib/utils";
import type { ActionResult } from "@/types";

interface InitialData {
  name?: string;
  slug?: string;
  description?: string;
  longDescription?: string | null;
  category?: ProductCategory;
  stacks?: string[];
  repositoryUrl?: string | null;
  productUrl?: string | null;
  note?: string | null;
  sortOrder?: number;
  isPublic?: boolean;
}

interface ProductFormProps {
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  initialData?: InitialData;
  existingStacks?: string[];
  cancelHref: string;
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

export function ProductForm({ action, initialData, existingStacks = [], cancelHref }: ProductFormProps) {
  const [state, formAction, isPending] = useActionState(action, null);

  const [category, setCategory] = useState<string>(initialData?.category ?? "");
  const [stacks, setStacks] = useState<string[]>(initialData?.stacks ?? []);
  const [stackInput, setStackInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? false);

  useEffect(() => {
    if (state?.success === false && state.error) {
      toast.error(state.error);
    }
  }, [state]);

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

  return (
    <form action={formAction} className="space-y-6 max-w-2xl">
      {/* Hidden inputs */}
      <input type="hidden" name="category" value={category} />
      {stacks.map((stack) => (
        <input key={stack} type="hidden" name="stacks" value={stack} />
      ))}
      <input type="hidden" name="isPublic" value={isPublic ? "true" : "false"} />

      {/* Name + Slug */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel>プロダクト名 <span className="text-red-400 normal-case">*</span></FieldLabel>
          <Input id="name" name="name" defaultValue={initialData?.name} />
          <FieldError message={fieldError("name")} />
        </div>
        <div>
          <FieldLabel>スラッグ <span className="text-red-400 normal-case">*</span></FieldLabel>
          <Input id="slug" name="slug" defaultValue={initialData?.slug} placeholder="例: my-product" />
          <FieldError message={fieldError("slug")} />
        </div>
      </div>

      {/* Description + Category */}
      <div className="grid grid-cols-[1fr_auto] gap-4 items-start">
        <div>
          <FieldLabel>概要説明 <span className="text-red-400 normal-case">*</span></FieldLabel>
          <Input id="description" name="description" defaultValue={initialData?.description} />
          <FieldError message={fieldError("description")} />
        </div>
        <div>
          <FieldLabel>カテゴリ <span className="text-red-400 normal-case">*</span></FieldLabel>
          <Select value={category} onValueChange={(value) => setCategory(value ?? "")}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="選択">
                {category ? PRODUCT_CATEGORY_LABELS[category as ProductCategory] : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(PRODUCT_CATEGORY_LABELS) as [ProductCategory, string][]).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={fieldError("category")} />
        </div>
      </div>

      {/* Long Description */}
      <div>
        <FieldLabel>詳細説明</FieldLabel>
        <Textarea id="longDescription" name="longDescription" rows={6} defaultValue={initialData?.longDescription ?? ""} />
      </div>

      {/* Stacks */}
      <div>
        <FieldLabel>技術スタック</FieldLabel>
        {stacks.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
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
            onChange={(e) => { setStackInput(e.target.value); setShowSuggestions(true); }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addStack(stackInput); } }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="技術名を入力してEnterで追加"
          />
          {showSuggestions && stackInput && filteredSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-md max-h-40 overflow-y-auto">
              {filteredSuggestions.slice(0, 8).map((s) => (
                <button key={s} type="button" className="w-full text-left px-3 py-1.5 hover:bg-muted text-sm" onMouseDown={() => addStack(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* URLs */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel>リポジトリURL</FieldLabel>
          <Input id="repositoryUrl" name="repositoryUrl" type="url" defaultValue={initialData?.repositoryUrl ?? ""} placeholder="https://github.com/..." />
          <FieldError message={fieldError("repositoryUrl")} />
        </div>
        <div>
          <FieldLabel>プロダクトURL</FieldLabel>
          <Input id="productUrl" name="productUrl" type="url" defaultValue={initialData?.productUrl ?? ""} placeholder="https://..." />
          <FieldError message={fieldError("productUrl")} />
        </div>
      </div>

      {/* Note */}
      <div>
        <FieldLabel>備考</FieldLabel>
        <Textarea id="note" name="note" rows={4} defaultValue={initialData?.note ?? ""} placeholder="ホスティング情報、DBサービスなど" />
      </div>

      {/* Sort Order + isPublic */}
      <div className="flex items-center gap-8">
        <div>
          <FieldLabel>表示順</FieldLabel>
          <Input id="sortOrder" name="sortOrder" type="number" defaultValue={initialData?.sortOrder ?? 0} className="w-20" />
        </div>
        <div className="flex items-center gap-2.5 pt-5">
          <Switch id="isPublic" checked={isPublic} onCheckedChange={setIsPublic} />
          <p className="text-sm text-slate-700">ブログで公開する</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-slate-100">
        <Button type="submit" disabled={isPending}>
          {isPending ? "保存中..." : "保存"}
        </Button>
        <Link href={cancelHref} className={cn(buttonVariants({ variant: "ghost" }))}>
          キャンセル
        </Link>
      </div>
    </form>
  );
}
