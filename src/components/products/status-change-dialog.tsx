"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { changeStatus } from "@/actions/status";
import { PRODUCT_STATUS_LABELS, PRODUCT_STATUS_VALUES } from "@/constants";
import type { ProductStatus } from "@prisma/client";

interface StatusChangeDialogProps {
  productId: string;
  currentStatus: ProductStatus;
}

export function StatusChangeDialog({ productId, currentStatus }: StatusChangeDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ProductStatus | "">("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState(() => format(new Date(), "HH:mm"));
  const [isPending, startTransition] = useTransition();

  const candidateStatuses = PRODUCT_STATUS_VALUES.filter((s) => s !== currentStatus);

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      setSelectedStatus("");
      setNote("");
      setDate(new Date());
      setTime(format(new Date(), "HH:mm"));
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
    if (!selectedStatus) return;

    startTransition(async () => {
      const result = await changeStatus(productId, {
        to: selectedStatus,
        note: note || undefined,
        changedAt: buildChangedAt(),
      });
      if (result.success) {
        toast.success("ステータスを変更しました");
        setOpen(false);
      } else {
        toast.error(result.error ?? "ステータスの変更に失敗しました");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>ステータスを変更</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ステータスを変更</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="status-select">変更先ステータス</Label>
            <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as ProductStatus)}>
              <SelectTrigger id="status-select">
                <SelectValue placeholder="ステータスを選択">{selectedStatus ? PRODUCT_STATUS_LABELS[selectedStatus] : undefined}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {candidateStatuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {PRODUCT_STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Label htmlFor="status-note">メモ（任意）</Label>
            <Textarea
              id="status-note"
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
          <Button onClick={handleSubmit} disabled={!selectedStatus || isPending}>
            {isPending ? "変更中..." : "変更する"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
