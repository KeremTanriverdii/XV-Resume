import React from 'react';

export default function ProfilesLoading() {
  return (
    <div className="flex flex-1 flex-col h-full gap-6 animate-pulse p-4 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="h-8 w-48 rounded-xl bg-muted/70" />
          <div className="h-4 w-72 rounded-md bg-muted/40" />
        </div>
        <div className="h-10 w-36 rounded-full bg-muted/60" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-56 rounded-3xl bg-muted/30 border border-border/60 p-6 flex flex-col justify-between" />
        ))}
      </div>
    </div>
  );
}
