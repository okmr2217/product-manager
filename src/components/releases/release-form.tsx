"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { ReleaseType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/lib/button-variants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RELEASE_TYPE_LABELS } from "@/constants";
import { cn } from "@/lib/utils";
import type { ActionResult } from "@/types";

const RELEASE_TYPES: ReleaseType[] = ["MAJOR", "MINOR", "PATCH", "HOTFIX"];

interface InitialData {
  version?: string;
  title?: string;
  content?: string;
  releaseDate?: Date | null;
  type?: ReleaseType;
  isDraft?: boolean;
}

interface ReleaseFormProps {
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  initialData?: InitialData;
  cancelHref: string;
  successHref: string;
}

export function ReleaseForm({ action, initialData, cancelHref, successHref }: ReleaseFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, null);

  const [releaseDate, setReleaseDate] = useState<Date | undefined>(
    initialData?.releaseDate ? new Date(initialData.releaseDate) : undefined
  );
  const [type, setType] = useState<string>(initialData?.type ?? "");
  const [isDraft, setIsDraft] = useState(initialData?.isDraft ?? true);

  useEffect(() => {
    if (state?.success === false && state.error) {
      toast.error(state.error);
    }
    if (state?.success === true) {
      toast.success(initialData?.version ? "リリースノートを更新しました" : "リリースノートを作成しました");
      router.push(successHref);
    }
  }, [state, router, successHref, initialData?.version]);

  const fieldError = (key: string) => state?.fieldErrors?.[key]?.[0];

  return (
    <form action={formAction} className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        {/* Version */}
        <div className="space-y-1.5">
          <Label htmlFor="version">バージョン *</Label>
          <Input
            id="version"
            name="version"
            defaultValue={initialData?.version ?? ""}
            placeholder="v1.0.0"
            aria-invalid={!!fieldError("version")}
          />
          {fieldError("version") && <p className="text-xs text-destructive">{fieldError("version")}</p>}
        </div>

        {/* Type */}
        <div className="space-y-1.5">
          <Label>リリースタイプ *</Label>
          <input type="hidden" name="type" value={type} />
          <Select value={type} onValueChange={(v) => setType(v ?? "")}>
            <SelectTrigger aria-invalid={!!fieldError("type")}>
              <SelectValue placeholder="タイプを選択">{type ? RELEASE_TYPE_LABELS[type as ReleaseType] : undefined}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {RELEASE_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {RELEASE_TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldError("type") && <p className="text-xs text-destructive">{fieldError("type")}</p>}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title">タイトル *</Label>
        <Input
          id="title"
          name="title"
          defaultValue={initialData?.title ?? ""}
          placeholder="例: タスクカテゴリ機能追加"
          aria-invalid={!!fieldError("title")}
        />
        {fieldError("title") && <p className="text-xs text-destructive">{fieldError("title")}</p>}
      </div>

      {/* Release Date */}
      <div className="space-y-1.5">
        <Label>リリース日 *</Label>
        <input type="hidden" name="releaseDate" value={releaseDate ? format(releaseDate, "yyyy-MM-dd") : ""} />
        <Popover>
          <PopoverTrigger
            render={
              <button
                type="button"
                className={cn(
                  "flex h-9 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-sm",
                  !releaseDate && "text-muted-foreground"
                )}
              />
            }
          >
            <CalendarIcon className="h-4 w-4 shrink-0" />
            {releaseDate ? format(releaseDate, "yyyy/MM/dd") : "日付を選択"}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={releaseDate} onSelect={setReleaseDate} />
          </PopoverContent>
        </Popover>
        {fieldError("releaseDate") && <p className="text-xs text-destructive">{fieldError("releaseDate")}</p>}
      </div>

      {/* Content */}
      <div className="space-y-1.5">
        <Label htmlFor="content">内容 *</Label>
        <Textarea
          id="content"
          name="content"
          defaultValue={initialData?.content ?? ""}
          placeholder="変更内容をマークダウンで記入..."
          rows={8}
          aria-invalid={!!fieldError("content")}
        />
        {fieldError("content") && <p className="text-xs text-destructive">{fieldError("content")}</p>}
      </div>

      {/* isDraft */}
      <div className="flex items-center gap-3">
        <input type="hidden" name="isDraft" value={isDraft ? "true" : "false"} />
        <Switch id="isDraft" checked={isDraft} onCheckedChange={setIsDraft} />
        <Label htmlFor="isDraft">下書き（公開しない）</Label>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Link href={cancelHref} className={cn(buttonVariants({ variant: "outline" }))}>
          キャンセル
        </Link>
        <Button type="submit" disabled={isPending}>
          {isPending ? "保存中..." : "保存する"}
        </Button>
      </div>
    </form>
  );
}
