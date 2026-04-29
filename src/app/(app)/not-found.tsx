import Link from "next/link";
import { buttonVariants } from "@/lib/button-variants";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-4xl font-bold text-slate-900 mb-2">404</h1>
      <p className="text-slate-500 mb-6">ページが見つかりませんでした</p>
      <Link href="/products" className={buttonVariants({ variant: "outline" })}>
        ダッシュボードへ戻る
      </Link>
    </div>
  );
}
