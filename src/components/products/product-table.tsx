import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import type { ProductWithLatestRelease } from "@/app/(app)/dashboard/page";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "./status-badge";
import { CategoryBadge } from "./category-badge";
import { StackTags } from "./stack-tags";

export function ProductTable({ products }: { products: ProductWithLatestRelease[] }) {
  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">画像</TableHead>
            <TableHead>プロダクト名</TableHead>
            <TableHead>カテゴリ</TableHead>
            <TableHead>ステータス</TableHead>
            <TableHead>技術スタック</TableHead>
            <TableHead>最新リリース</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const thumbnail = product.images[0];
            return (
              <TableRow key={product.id}>
                <TableCell>
                  <Link href={`/products/${product.slug}`} className="block">
                    <div className="w-12 h-9 bg-slate-100 rounded overflow-hidden relative">
                      {thumbnail ? (
                        <Image src={thumbnail.url} alt={thumbnail.alt ?? product.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">-</div>
                      )}
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={`/products/${product.slug}`} className="font-medium hover:underline">
                    {product.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <CategoryBadge category={product.category} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={product.status} />
                </TableCell>
                <TableCell>
                  <StackTags stacks={product.stacks} maxDisplay={3} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {product.latestRelease ? (
                    <span>
                      {product.latestRelease.version} · {format(product.latestRelease.releaseDate, "yyyy/MM/dd")}
                    </span>
                  ) : (
                    "-"
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
