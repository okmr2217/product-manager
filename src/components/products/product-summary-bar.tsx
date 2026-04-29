type SummaryCardProps = { label: string; value: number; color?: "success" | "info" | "muted" };

function SummaryCard({ label, value, color }: SummaryCardProps) {
  const valueClass = color === "success" ? "text-green-600" : color === "info" ? "text-blue-600" : "text-muted-foreground";
  return (
    <div className="bg-muted/50 rounded-lg px-4 py-3">
      <p className="text-[11px] text-muted-foreground mb-1">{label}</p>
      <p className={`text-[22px] font-medium leading-none ${valueClass}`}>{value}</p>
    </div>
  );
}

type Props = { total: number; released: number; developing: number; idea: number };

export function ProductSummaryBar({ total, released, developing, idea }: Props) {
  return (
    <div className="grid grid-cols-4 gap-3 mb-5">
      <SummaryCard label="全プロジェクト" value={total} />
      <SummaryCard label="リリース済み" value={released} color="success" />
      <SummaryCard label="開発中" value={developing} color="info" />
      <SummaryCard label="アイデア" value={idea} color="muted" />
    </div>
  );
}
