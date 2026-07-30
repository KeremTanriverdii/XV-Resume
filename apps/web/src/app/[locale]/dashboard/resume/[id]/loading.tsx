import React from 'react';

export default function ResumeDetailLoading() {
  return (
    <div className="flex flex-1 flex-col h-full gap-6 animate-pulse px-4 py-6">
      {/* Header bar skeleton */}
      <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-muted/60" />
          <div className="flex flex-col gap-1.5">
            <div className="h-6 w-48 rounded-md bg-muted/70" />
            <div className="h-3.5 w-32 rounded-md bg-muted/40" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-28 rounded-full bg-muted/60" />
          <div className="h-10 w-32 rounded-full bg-muted/60" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-2 flex-1">
        {/* Left Column Controls */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="h-40 rounded-2xl bg-muted/40 border border-border/50 p-4" />
          <div className="h-32 rounded-2xl bg-muted/40 border border-border/50 p-4" />
          <div className="h-48 rounded-2xl bg-muted/40 border border-border/50 p-4" />
        </div>

        {/* Right Column Document Preview */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="h-12 rounded-2xl bg-muted/50 w-full" />
          <div className="h-[750px] rounded-3xl bg-muted/30 border border-border/60 p-8 shadow-xs" />
        </div>
      </div>
    </div>
  );
}
