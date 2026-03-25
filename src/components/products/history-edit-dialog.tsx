"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { CalendarIcon, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { updateStatusHistory } from "@/actions/status";
import { PRODUCT_STATUS_LABELS } from "@/constants";
import type { ProductStatus } from "@prisma/client";

const ALL_STATUSES: ProductStatus[] = ["IDEA", "DEVELOPING", "RELEASED", "MAINTENANCE", "PAUSED"];

interface HistoryEntry {
  id: string;
  from: ProductStatus;
  to: ProductStatus;
  note: string | null;
  changedAt: Date;
}

interface HistoryEditDialogProps {
  entry: HistoryEntry;
}

export function HistoryEditDialog({ entry }: HistoryEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState<ProductStatus>(entry.from);
  const [to, setTo] = useState<ProductStatus>(entry.to);
  const [note, setNote] = useState(entry.note ?? "");
  const [date, setDate] = useState<Date | undefined>(new Date(entry.changedAt));
  const [time, setTime] = useState(format(new Date(entry.changedAt), "HH:mm"));
  const [isPending, startTransition] = useTransition();

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      setFrom(entry.from);
      setTo(entry.to);
      setNote(entry.note ?? "");
      setDate(new Date(entry.changedAt));
      setTime(format(new Date(entry.changedAt), "HH:mm"));
    }
  };

  const buildChangedAt = (): Date => {
    const base = date ?? new Date();
    const [hours, minutes] = time.split(":").map(Number);
    const result = new Date(base);
    result.setHours(hours, minutes, 0, 0);
    return result;
  };

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await updateStatusHistory(entry.id, {
        from,
        to,
        note: note || undefined,
        changedAt: buildChangedAt(),
      });
      if (result.success) {
        toast.success("ステータス履歴を更新しました");
        setOpen(false);
      } else {
        toast.error(result.error ?? "更新に失敗しました");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="ghost" size="sm" />}>
        <Pencil className="h-3.5 w-3.5" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ステータス履歴を編集</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>変更前</Label>
              <Select value={from} onValueChange={(v) => setFrom(v as ProductStatus)}>
                <SelectTrigger>
                  <SelectValue>{PRODUCT_STATUS_LABELS[from]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {ALL_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {PRODUCT_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>変更後</Label>
              <Select value={to} onValueChange={(v) => setTo(v as ProductStatus)}>
                <SelectTrigger>
                  <SelectValue>{PRODUCT_STATUS_LABELS[to]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {ALL_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {PRODUCT_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>変更日時</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger
                  render={
                    <button
                      type="button"
                      className={cn(
                        "flex h-9 flex-1 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm",
                        !date && "text-muted-foreground"
                      )}
                    />
                  }
                >
                  <CalendarIcon className="h-4 w-4 shrink-0" />
                  {date ? format(date, "yyyy/MM/dd") : "日付を選択"}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} />
                </PopoverContent>
              </Popover>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-28"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>メモ（任意）</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="変更理由など"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "保存中..." : "保存する"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
