export default function Loading() {
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="animate-pulse max-w-6xl mx-auto space-y-6">
        <div className="h-10 bg-muted rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
