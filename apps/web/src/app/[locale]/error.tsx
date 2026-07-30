'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-destructive/20 blur-2xl animate-pulse" />
        <div className="relative h-20 w-20 rounded-3xl bg-card border-2 border-destructive/30 flex items-center justify-center shadow-xl shadow-destructive/10">
          <AlertOctagon className="h-10 w-10 text-destructive" />
        </div>
      </div>

      <h2 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">
        Bir Hata Oluştu
      </h2>
      <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
        İşleminiz gerçekleştirilirken beklenmeyen bir sorun meydana geldi. Lütfen tekrar deneyin.
      </p>

      <div className="flex items-center gap-3 flex-wrap justify-center">
        <Button onClick={reset} className="rounded-full gap-2 px-6 bg-primary text-primary-foreground">
          <RefreshCw className="h-4 w-4" />
          <span>Yeniden Dene</span>
        </Button>

        <Button asChild variant="outline" className="rounded-full gap-2 px-6">
          <Link href="/dashboard">
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
