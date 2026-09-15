export default function Loading() {
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="animate-pulse max-w-6xl mx-auto space-y-6">
        <div className="h-10 bg-muted rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
