export default function Loading() {
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="animate-pulse max-w-4xl mx-auto space-y-6">
        <div className="h-10 bg-muted rounded w-64" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
