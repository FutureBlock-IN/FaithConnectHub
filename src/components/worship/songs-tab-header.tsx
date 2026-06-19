type SongsTabHeaderProps = {
  count: number;
};

export function SongsTabHeader({ count }: SongsTabHeaderProps) {
  const countLabel = `${count} ${count === 1 ? "Song" : "Songs"}`;

  return (
    <header className="mb-4 flex items-end justify-between gap-4 border-b border-border/30 pb-4">
      <div className="min-w-0 space-y-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary/55">
          Worship Collection
        </p>
        <h2 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-[1.75rem]">
          Songs
        </h2>
      </div>
      <p className="shrink-0 rounded-full border border-border/40 bg-muted/40 px-3 py-1 text-xs font-semibold tabular-nums text-muted-foreground sm:text-sm">
        {countLabel}
      </p>
    </header>
  );
}
