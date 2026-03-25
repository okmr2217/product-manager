"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteProduct } from "@/actions/products";

interface DeleteDialogProps {
  product: { id: string; name: string };
}

export function DeleteDialog({ product }: DeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteProduct(product.id);
      if (result && !result.success) {
        toast.error(result.error ?? "削除に失敗しました");
        setOpen(false);
      }
    });
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) setInputValue("");
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
        <Trash2 className="h-4 w-4 mr-1" />
        削除
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>プロダクトを削除しますか？</AlertDialogTitle>
          <AlertDialogDescription>
            この操作は取り消せません。関連する画像・タスク・リリースノートもすべて削除されます。
            <br />
            <br />
            確認のため「<strong>{product.name}</strong>」と入力してください。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={product.name} />
        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={inputValue !== product.name || isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "削除中..." : "削除する"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
