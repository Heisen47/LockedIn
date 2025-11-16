interface Props {
  tags: string[];
}

export default function TagList({ tags }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((t) => (
        <span
          key={t}
          className="rounded-full border border-slate-700/60 bg-slate-900/40 px-2.5 py-1 text-xs text-slate-300 backdrop-blur-sm"
        >
          {t}
        </span>
      ))}
    </div>
  );
}
