"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Mail, LogOut, Lock, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { signOut, useSession, changePassword } from "@/lib/auth-client";

export default function SettingsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, startPasswordTransition] = useTransition();
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      router.push("/login");
    } catch {
      setIsLoggingOut(false);
    }
  };

  const handlePasswordChange = () => {
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("新しいパスワードが一致しません");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("パスワードは8文字以上である必要があります");
      return;
    }

    startPasswordTransition(async () => {
      try {
        const result = await changePassword({
          currentPassword,
          newPassword,
          revokeOtherSessions: false,
        });
        if (result.error) {
          setPasswordError(result.error.message || "パスワードの変更に失敗しました");
        } else {
          setPasswordSuccess(true);
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          setTimeout(() => {
            setIsPasswordDialogOpen(false);
            setPasswordSuccess(false);
          }, 1500);
        }
      } catch (error) {
        setPasswordError(error instanceof Error ? error.message : "パスワードの変更に失敗しました");
      }
    });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 mb-1">設定</h1>
        <p className="text-sm text-slate-500">アカウント情報の確認・パスワードの変更ができます。</p>
      </div>

      <section>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">アカウント</h2>
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-slate-400" />
              <div>
                <div className="text-sm font-medium text-slate-800">メールアドレス</div>
                <div className="text-sm text-slate-500">{session?.user?.email ?? "読み込み中..."}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-slate-400" />
              <div>
                <div className="text-sm font-medium text-slate-800">パスワード</div>
                <div className="text-sm text-slate-500">••••••••</div>
              </div>
            </div>
            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
              <DialogTrigger render={<Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-700 hover:bg-slate-100" />}>
                <Edit className="h-4 w-4" />
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>パスワードの変更</DialogTitle>
                  <DialogDescription>現在のパスワードと新しいパスワードを入力してください</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">現在のパスワード</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      disabled={isChangingPassword}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">新しいパスワード</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isChangingPassword}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">新しいパスワード（確認）</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isChangingPassword}
                    />
                  </div>
                  {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
                  {passwordSuccess && <p className="text-sm text-green-500">パスワードを変更しました</p>}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsPasswordDialogOpen(false);
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setPasswordError(null);
                    }}
                    disabled={isChangingPassword}
                  >
                    キャンセル
                  </Button>
                  <Button
                    onClick={handlePasswordChange}
                    disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                  >
                    {isChangingPassword ? "変更中..." : "変更する"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">その他</h2>
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 p-4 text-left text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <LogOut className="h-5 w-5 text-slate-400" />
            <span className="text-sm font-medium">{isLoggingOut ? "ログアウト中..." : "ログアウト"}</span>
          </button>
        </div>
      </section>
    </div>
  );
}
