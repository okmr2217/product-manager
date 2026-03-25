"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { changeStatus } from "@/actions/status";
import { PRODUCT_STATUS_LABELS } from "@/constants";
import type { ProductStatus } from "@prisma/client";

const ALL_STATUSES: ProductStatus[] = ["IDEA", "DEVELOPING", "RELEASED", "MAINTENANCE", "PAUSED"];

interface StatusChangeDialogProps {
  productId: string;
  currentStatus: ProductStatus;
}

export function StatusChangeDialog({ productId, currentStatus }: StatusChangeDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ProductStatus | "">("");
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  const candidateStatuses = ALL_STATUSES.filter((s) => s !== currentStatus);

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      setSelectedStatus("");
      setNote("");
    }
  };

  const handleSubmit = () => {
    if (!selectedStatus) return;

    startTransition(async () => {
      const result = await changeStatus(productId, { to: selectedStatus, note: note || undefined });
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
                <SelectValue placeholder="ステータスを選択" />
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
