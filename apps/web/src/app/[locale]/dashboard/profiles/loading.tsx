import { Skeleton } from "@/components/ui/skeleton"

export default function ProfilesLoading() {
  return (
    <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6 w-full">
      {/* Left Column: Title + ProfileCreateForm Skeleton */}
      <div className="lg:col-span-7 space-y-6">
        <Skeleton className="h-9 w-48 bg-muted/60 animate-pulse" />
        
        {/* Form Skeleton */}
        <div className="w-full space-y-4 border rounded-lg p-6 bg-card text-card-foreground shadow-sm">
          <div className="flex items-center justify-between border-b pb-3">
            <Skeleton className="h-6 w-32 bg-muted/60 animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between gap-4">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-24 bg-muted/60 animate-pulse" />
                <Skeleton className="h-10 w-full bg-muted/60 animate-pulse" />
              </div>
              <div className="space-y-2 w-48">
                <Skeleton className="h-4 w-24 bg-muted/60 animate-pulse" />
                <Skeleton className="h-10 w-full bg-muted/60 animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Skeleton className="h-4 w-20 bg-muted/60 animate-pulse" />
              <Skeleton className="h-10 w-full bg-muted/60 animate-pulse" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16 bg-muted/60 animate-pulse" />
                <Skeleton className="h-10 w-full bg-muted/60 animate-pulse" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20 bg-muted/60 animate-pulse" />
                <Skeleton className="h-10 w-full bg-muted/60 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Profiles List Skeleton */}
      <div className="lg:col-span-5 space-y-6">
        <Skeleton className="h-8 w-56 mb-6 bg-muted/60 animate-pulse" />
        <div className="grid grid-cols-1 gap-4 animate-pulse">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="p-5 border rounded-2xl bg-card flex gap-4 items-start shadow-xs">
              <div className="flex-1 space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-2/3 bg-muted/60" />
                    <Skeleton className="h-4 w-1/2 bg-muted/60" />
                  </div>
                  <Skeleton className="h-20 w-20 rounded-md shrink-0 bg-muted/60" />
                </div>
                <div className="border-t pt-3 space-y-2">
                  <Skeleton className="h-3 w-3/4 bg-muted/60" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
