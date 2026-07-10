import { Skeleton } from "@/components/ui/skeleton"

export default function EducationsLoading() {
  return (
    <main className="flex w-full flex-1 flex-col gap-6 p-4 animate-pulse">
      <div className="flex items-center justify-between border-b pb-4">
        <Skeleton className="h-8 w-48 bg-muted/60" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-5 border rounded-2xl bg-card flex gap-4 items-start shadow-xs">
            <Skeleton className="h-10 w-10 rounded-lg bg-muted/60 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-1/2 bg-muted/60" />
              <Skeleton className="h-4 w-1/3 bg-muted/60" />
              <Skeleton className="h-3 w-1/4 bg-muted/60" />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
