'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function SessionDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-1 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      {/* Header Bar Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 sm:w-64 rounded-lg" />
            <Skeleton className="h-3.5 w-32 rounded-md" />
          </div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>
      </div>

      {/* Main 2-Column Grid: Controls & Document */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (4 cols): AI Session Options Card Skeleton */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="rounded-2xl border border-border/80 bg-card/70 p-6 shadow-sm flex flex-col gap-5">
            {/* Options Title */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-36 rounded-md" />
            </div>

            {/* Dropdown 1: Dil / Language */}
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-16 rounded-sm" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>

            {/* Dropdown 2: Sürüm / Version */}
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-16 rounded-sm" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>

            {/* CV Template Selector (2x2 Grid) */}
            <div className="space-y-2">
              <Skeleton className="h-3 w-24 rounded-sm" />
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-9 rounded-xl" />
                <Skeleton className="h-9 rounded-xl" />
                <Skeleton className="h-9 rounded-xl" />
                <Skeleton className="h-9 rounded-xl" />
              </div>
            </div>

            {/* Color Theme Selector */}
            <div className="space-y-2">
              <Skeleton className="h-3 w-20 rounded-sm" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-7 w-7 rounded-full" />
              </div>
            </div>

            {/* Target Generation Languages Grid */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Skeleton className="h-3 w-32 rounded-sm" />
                <Skeleton className="h-3 w-16 rounded-sm" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Skeleton className="h-8 rounded-xl" />
                <Skeleton className="h-8 rounded-xl" />
                <Skeleton className="h-8 rounded-xl" />
                <Skeleton className="h-8 rounded-xl" />
                <Skeleton className="h-8 rounded-xl" />
                <Skeleton className="h-8 rounded-xl" />
              </div>
            </div>

            {/* Regenerate AI Button */}
            <Skeleton className="h-11 w-full rounded-2xl mt-2" />
          </div>
        </div>

        {/* Right Column (8 cols): Tabs & CV Document Skeleton */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Tabs Bar Skeleton */}
          <div className="flex items-center gap-2 border-b border-border/80 pb-3 overflow-x-auto">
            <Skeleton className="h-9 w-36 rounded-xl shrink-0" />
            <Skeleton className="h-9 w-32 rounded-xl shrink-0" />
            <Skeleton className="h-9 w-28 rounded-xl shrink-0" />
            <Skeleton className="h-9 w-28 rounded-xl shrink-0" />
            <Skeleton className="h-9 w-28 rounded-xl shrink-0" />
          </div>

          {/* CV Document Container Skeleton */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-10 shadow-lg flex flex-col gap-6 min-h-[750px]">
            {/* Header: Photo & Name / Contact info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-2xl shrink-0" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-52 rounded-md" />
                  <Skeleton className="h-4 w-36 rounded-md" />
                </div>
              </div>
              <div className="space-y-1.5 text-right w-full sm:w-auto">
                <Skeleton className="h-3.5 w-40 rounded-md ml-auto" />
                <Skeleton className="h-3.5 w-32 rounded-md ml-auto" />
                <Skeleton className="h-3.5 w-28 rounded-md ml-auto" />
              </div>
            </div>

            {/* Section 1: SUMMARY */}
            <div className="space-y-2.5">
              <Skeleton className="h-4 w-24 rounded-md uppercase" />
              <div className="space-y-2 border-l-2 border-primary/30 pl-3">
                <Skeleton className="h-3.5 w-full rounded-md" />
                <Skeleton className="h-3.5 w-[94%] rounded-md" />
                <Skeleton className="h-3.5 w-[80%] rounded-md" />
              </div>
            </div>

            {/* Section 2: EDUCATION */}
            <div className="space-y-2.5 pt-2">
              <Skeleton className="h-4 w-28 rounded-md uppercase" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-3.5 w-1/2 rounded-md" />
              </div>
            </div>

            {/* Section 3: SKILLS */}
            <div className="space-y-2.5 pt-2">
              <Skeleton className="h-4 w-20 rounded-md uppercase" />
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-full rounded-md" />
                <Skeleton className="h-3.5 w-[88%] rounded-md" />
                <Skeleton className="h-3.5 w-[75%] rounded-md" />
              </div>
            </div>

            {/* Section 4: LANGUAGES */}
            <div className="space-y-2.5 pt-2">
              <Skeleton className="h-4 w-24 rounded-md uppercase" />
              <Skeleton className="h-3.5 w-48 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
