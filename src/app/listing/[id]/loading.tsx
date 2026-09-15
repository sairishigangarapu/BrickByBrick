export default function Loading() {
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="animate-pulse max-w-5xl mx-auto space-y-6">
        <div className="h-8 bg-muted rounded w-64" />
        <div className="h-64 bg-muted rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}
