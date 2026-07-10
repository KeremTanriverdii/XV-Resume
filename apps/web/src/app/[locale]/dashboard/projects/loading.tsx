import { Skeleton } from "@/components/ui/skeleton"

export default function ProjectsLoading() {
  return (
    <main className="flex w-full flex-1 flex-col gap-6 p-4 animate-pulse">
      <div className="flex items-center justify-between border-b pb-4">
        <Skeleton className="h-8 w-48 bg-muted/60" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-5 flex flex-col justify-between shadow-xs">
            <div className="space-y-3">
              <Skeleton className="h-5 w-2/3 bg-muted/60" />
              <div className="flex gap-1.5">
                <Skeleton className="h-4 w-12 rounded bg-muted/60" />
                <Skeleton className="h-4 w-16 rounded bg-muted/60" />
              </div>
              <div className="border-t pt-3 space-y-2">
                <Skeleton className="h-3.5 w-full bg-muted/60" />
                <Skeleton className="h-3.5 w-5/6 bg-muted/60" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
