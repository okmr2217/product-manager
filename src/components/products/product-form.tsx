"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import type { ProductCategory } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/lib/button-variants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  releaseDate?: Date | null;
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

export function ProductForm({ action, initialData, existingStacks = [], cancelHref }: ProductFormProps) {
  const [state, formAction, isPending] = useActionState(action, null);

  const [category, setCategory] = useState<string>(initialData?.category ?? "");
  const [releaseDate, setReleaseDate] = useState<Date | undefined>(
    initialData?.releaseDate ? new Date(initialData.releaseDate) : new Date()
  );
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
    <form action={formAction} className="space-y-5 max-w-2xl">
      {/* Hidden inputs for controlled fields */}
      <input type="hidden" name="category" value={category} />
      <input type="hidden" name="releaseDate" value={releaseDate ? releaseDate.toISOString() : ""} />
      {stacks.map((stack) => (
        <input key={stack} type="hidden" name="stacks" value={stack} />
      ))}
      <input type="hidden" name="isPublic" value={isPublic ? "true" : "false"} />

      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">
          プロダクト名 <span className="text-red-500">*</span>
        </Label>
        <Input id="name" name="name" defaultValue={initialData?.name} className="max-w-sm" />
        {fieldError("name") && <p className="text-sm text-red-500">{fieldError("name")}</p>}
      </div>

      {/* Slug */}
      <div className="space-y-1.5">
        <Label htmlFor="slug">
          スラッグ <span className="text-red-500">*</span>
        </Label>
        <Input id="slug" name="slug" defaultValue={initialData?.slug} placeholder="例: my-product" className="max-w-xs" />
        <p className="text-xs text-muted-foreground">小文字英数字とハイフンのみ（例: yarukoto）</p>
        {fieldError("slug") && <p className="text-sm text-red-500">{fieldError("slug")}</p>}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">
          概要説明 <span className="text-red-500">*</span>
        </Label>
        <Input id="description" name="description" defaultValue={initialData?.description} className="max-w-md" />
        {fieldError("description") && <p className="text-sm text-red-500">{fieldError("description")}</p>}
      </div>

      {/* Long Description */}
      <div className="space-y-1.5">
        <Label htmlFor="longDescription">詳細説明</Label>
        <Textarea id="longDescription" name="longDescription" rows={8} defaultValue={initialData?.longDescription ?? ""} />
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label>
          カテゴリ <span className="text-red-500">*</span>
        </Label>
        <Select value={category} onValueChange={(value) => setCategory(value ?? "")}>
          <SelectTrigger>
            <SelectValue placeholder="カテゴリを選択">{category ? PRODUCT_CATEGORY_LABELS[category as ProductCategory] : undefined}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {(Object.entries(PRODUCT_CATEGORY_LABELS) as [ProductCategory, string][]).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldError("category") && <p className="text-sm text-red-500">{fieldError("category")}</p>}
      </div>

      {/* Release Date */}
      <div className="space-y-1.5">
        <Label>リリース日</Label>
        <Popover>
          <PopoverTrigger render={<button type="button" className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start text-left font-normal")} />}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {releaseDate ? format(releaseDate, "yyyy/MM/dd") : "日付を選択"}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={releaseDate} onSelect={setReleaseDate} />
          </PopoverContent>
        </Popover>
      </div>

      {/* Stacks */}
      <div className="space-y-1.5">
        <Label>技術スタック</Label>
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

      {/* Repository URL */}
      <div className="space-y-1.5">
        <Label htmlFor="repositoryUrl">リポジトリURL</Label>
        <Input id="repositoryUrl" name="repositoryUrl" type="url" defaultValue={initialData?.repositoryUrl ?? ""} placeholder="https://github.com/..." className="max-w-md" />
        {fieldError("repositoryUrl") && <p className="text-sm text-red-500">{fieldError("repositoryUrl")}</p>}
      </div>

      {/* Product URL */}
      <div className="space-y-1.5">
        <Label htmlFor="productUrl">プロダクトURL</Label>
        <Input id="productUrl" name="productUrl" type="url" defaultValue={initialData?.productUrl ?? ""} placeholder="https://..." className="max-w-md" />
        {fieldError("productUrl") && <p className="text-sm text-red-500">{fieldError("productUrl")}</p>}
      </div>

      {/* Note */}
      <div className="space-y-1.5">
        <Label htmlFor="note">備考</Label>
        <Textarea id="note" name="note" rows={6} defaultValue={initialData?.note ?? ""} placeholder="ホスティング情報、DBサービスなど" />
      </div>

      {/* Sort Order */}
      <div className="space-y-1.5">
        <Label htmlFor="sortOrder">表示順</Label>
        <Input id="sortOrder" name="sortOrder" type="number" defaultValue={initialData?.sortOrder ?? 0} className="w-24" />
      </div>

      {/* isPublic */}
      <div className="flex items-center gap-3">
        <Switch id="isPublic" checked={isPublic} onCheckedChange={setIsPublic} />
        <Label htmlFor="isPublic">ブログで公開する</Label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Link href={cancelHref} className={cn(buttonVariants({ variant: "outline" }))}>キャンセル</Link>
        <Button type="submit" disabled={isPending}>
          {isPending ? "保存中..." : "保存"}
        </Button>
      </div>
    </form>
  );
}
