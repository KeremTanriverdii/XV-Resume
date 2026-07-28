'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl animate-pulse" />
        <div className="relative h-24 w-24 rounded-3xl bg-card border-2 border-primary/30 flex items-center justify-center shadow-xl shadow-primary/10">
          <FileQuestion className="h-12 w-12 text-primary" />
        </div>
      </div>

      <h1 className="text-4xl font-extrabold text-foreground tracking-tight mb-2">
        404 - Sayfa Bulunamadı
      </h1>
      <p className="text-sm text-muted-foreground max-w-md mb-8 leading-relaxed">
        Aradığınız sayfa kaldırılmış, adı değiştirilmiş veya geçici olarak erişilemiyor olabilir.
      </p>

      <div className="flex items-center gap-3 flex-wrap justify-center">
        <Button asChild variant="outline" className="rounded-full gap-2 px-6">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            <span>Dashboard'a Dön</span>
          </Link>
        </Button>

        <Button asChild className="rounded-full gap-2 px-6 bg-primary text-primary-foreground">
          <Link href="/">
            <Home className="h-4 w-4" />
            <span>Ana Sayfa</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
