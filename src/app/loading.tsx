export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse space-y-4 w-full max-w-md px-4">
        <div className="h-8 bg-muted rounded w-3/4 mx-auto" />
        <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
        <div className="space-y-3 mt-8">
          <div className="h-32 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}
