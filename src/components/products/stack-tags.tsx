interface StackTagsProps {
  stacks: string[];
  maxDisplay?: number;
}

export function StackTags({ stacks, maxDisplay }: StackTagsProps) {
  if (stacks.length === 0) return null;

  const displayed = maxDisplay ? stacks.slice(0, maxDisplay) : stacks;
  const remaining = maxDisplay ? stacks.length - maxDisplay : 0;

  return (
    <div className="flex flex-wrap gap-1">
      {displayed.map((stack) => (
        <span key={stack} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
          {stack}
        </span>
      ))}
      {remaining > 0 && (
        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">+{remaining}</span>
      )}
    </div>
  );
}
