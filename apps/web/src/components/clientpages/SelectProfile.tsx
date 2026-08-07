'use client';

import { useState, useEffect } from 'react';
import { useProfiles } from '@/hooks/useProfile';
import { Loader2, Check, User, Sparkles, Mail, Phone, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function SelectProfile({
  token,
  selectedProfileId,
  onSelect,
}: {
  token: string | undefined;
  selectedProfileId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const t = useTranslations('profiles');
  const tDetail = useTranslations('atsScanDetail');
  const { data: profiles, isLoading, error } = useProfiles(token!);

  // Auto-select first profile once on initial load if none selected
  useEffect(() => {
    if (profiles && profiles.length > 0 && !selectedProfileId) {
      onSelect(profiles[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profiles]);

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center p-4 border border-border/60 rounded-2xl bg-muted/20 text-xs text-muted-foreground gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span>{t('loading') || 'Profiler yükleniyor...'}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full text-xs text-destructive font-medium text-center p-4 border border-dashed border-destructive/30 rounded-2xl bg-destructive/5">
        {t('error') || 'Profiler yüklenirken bir hata oluştu.'}
      </div>
    );
  }

  if (!profiles || profiles.length === 0) {
    return (
      <div className="w-full text-xs text-muted-foreground font-medium text-center p-4 border border-dashed border-border/80 rounded-2xl bg-muted/10">
        {t('notFound') || 'Henüz bir profiliniz yok. Lütfen önce profil oluşturun.'}
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <label className="text-xs font-bold text-foreground flex items-center gap-1.5 px-1">
        <User className="h-3.5 w-3.5 text-primary" />
        <span>{tDetail('selectProfileToUse') || 'Kullanılacak Profilinizi Seçin'}</span>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
        {profiles.map((p) => {
          const isSelected = selectedProfileId === p.id;
          const initial = p.fullName ? p.fullName.charAt(0).toUpperCase() : 'P';
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p.id)}
              className={`relative flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer group ${
                isSelected
                  ? 'border-primary bg-primary/10 shadow-md ring-2 ring-primary/20'
                  : 'border-border/80 bg-card hover:bg-muted/50 hover:border-primary/40'
              }`}
            >
              {/* Avatar / Photo */}
              {p.showPhoto && p.photoUrl ? (
                <img
                  src={p.photoUrl}
                  alt={p.fullName}
                  className="h-10 w-10 rounded-xl object-cover border border-border/80 shrink-0 shadow-xs"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'
                  }`}
                >
                  {initial}
                </div>
              )}

              {/* Info */}
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold text-foreground truncate">
                    {p.profileName || 'Profil'}
                  </span>
                  {isSelected && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-primary/20 text-primary font-bold">
                      {tDetail('active') || 'Aktif'}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-muted-foreground truncate font-medium mt-0.5">
                  {p.fullName}
                </span>
                {p.title && (
                  <span className="text-[10px] text-primary/80 truncate font-semibold">
                    {p.title}
                  </span>
                )}
              </div>

              {/* Checkmark */}
              {isSelected && (
                <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-xs">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
