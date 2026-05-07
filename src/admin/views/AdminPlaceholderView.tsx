export function AdminPlaceholderView({ title }: Readonly<{ title: string }>) {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="mt-2 text-sm text-secondary">Coming in a later phase.</p>
    </div>
  );
}
