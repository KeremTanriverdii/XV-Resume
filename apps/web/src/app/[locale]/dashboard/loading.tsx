import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="flex flex-1 flex-col h-full gap-8 mt-8 lg:mt-12 animate-pulse px-4">
      <div className="flex flex-col items-center text-center gap-4 max-w-3xl mx-auto w-full">
        <div className="h-16 w-16 rounded-2xl bg-muted/60 mb-2" />
        <div className="h-9 w-64 rounded-xl bg-muted/60" />
        <div className="h-5 w-96 max-w-full rounded-lg bg-muted/40" />
        <div className="w-full max-w-2xl h-14 rounded-full bg-muted/50 mt-4" />
        <div className="w-full max-w-2xl h-12 rounded-2xl bg-muted/40" />
        <div className="w-full max-w-2xl h-24 rounded-2xl bg-muted/40" />
        <div className="h-12 w-48 rounded-full bg-muted/60 mt-2" />
      </div>

      <div className="mt-8 flex-1 rounded-3xl border border-dashed border-border bg-muted/10 p-8 flex flex-col items-center justify-center max-w-4xl mx-auto w-full h-48">
        <div className="h-12 w-12 rounded-full bg-muted/60 mb-3" />
        <div className="h-5 w-40 rounded-md bg-muted/60 mb-2" />
        <div className="h-4 w-64 rounded-md bg-muted/40" />
      </div>
    </div>
  );
}
