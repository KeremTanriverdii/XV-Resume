'use client';

import { useState } from 'react';
import { Profile } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProfiles, deleteProfile } from '@/services/profileService';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Loader2 } from 'lucide-react';

interface ProfileListClientProps {
  token: string | undefined;
  userId: string | undefined;
  onEdit?: (profile: Profile) => void;
  activeEditId?: string | null;
}

export default function ProfileListClient({
  token,
  userId,
  onEdit,
  activeEditId,
}: ProfileListClientProps) {
  const t = useTranslations('profiles');
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    data: profiles,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['profiles', userId],
    queryFn: () => fetchProfiles(token),
    enabled: !!token && !!userId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProfile(id, token),

    // 1. Instantly remove item from UI cache (0ms response feel)
    onMutate: async (deletedId: string) => {
      setDeletingId(deletedId);
      await queryClient.cancelQueries({ queryKey: ['profiles', userId] });

      const previousProfiles = queryClient.getQueryData<Profile[]>([
        'profiles',
        userId,
      ]);

      queryClient.setQueryData<Profile[]>(
        ['profiles', userId],
        (old) => (old ? old.filter((p) => p.id !== deletedId) : []),
      );

      return { previousProfiles };
    },

    // 2. Rollback if server returns error
    onError: (err, deletedId, context) => {
      if (context?.previousProfiles) {
        queryClient.setQueryData(
          ['profiles', userId],
          context.previousProfiles,
        );
      }
    },

    // 3. Clean state & re-sync
    onSettled: () => {
      setDeletingId(null);
      queryClient.invalidateQueries({ queryKey: ['profiles', userId] });
    },
  });

  const handleDelete = (id: string) => {
    if (
      window.confirm(
        t('confirmDelete') || 'Bu profili silmek istediğinize emin misiniz?',
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-3xl font-semibold animate-pulse">
          {t('loading')}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-5 border rounded-2xl bg-card flex gap-4 items-start shadow-xs animate-pulse"
            >
              <div className="flex-1 space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-2/3 bg-muted/60" />
                    <Skeleton className="h-4 w-1/2 bg-muted/60" />
                    <Skeleton className="h-3 w-1/3 bg-muted/60" />
                  </div>
                  <Skeleton className="h-20 w-20 rounded-md shrink-0 bg-muted/60" />
                </div>
                <div className="border-t pt-3 space-y-2">
                  <Skeleton className="h-3 w-3/4 bg-muted/60" />
                  <Skeleton className="h-3 w-2/3 bg-muted/60" />
                </div>
                <div className="flex gap-1.5 pt-1">
                  <Skeleton className="h-5 w-14 rounded-full bg-muted/60" />
                  <Skeleton className="h-5 w-10 rounded-full bg-muted/60" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-sm text-destructive">{t('error')}</div>;
  }

  if (!profiles || profiles.length === 0) {
    return (
      <div className="text-sm text-muted-foreground border border-dashed rounded-lg p-6 text-center">
        {t('notFound')}
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      <h1 className="text-3xl font-bold mb-6">{t('myProfiles')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {profiles.map((profile: Profile) => {
          const isBeingEdited = activeEditId === profile.id;
          const isDeletingThis = deletingId === profile.id;

          return (
            <div
              key={profile.id}
              className={`p-5 border rounded-2xl shadow-sm bg-card text-card-foreground flex flex-col justify-between relative group transition-all duration-300 ${
                isDeletingThis
                  ? 'opacity-40 pointer-events-none scale-[0.98] border-destructive/50'
                  : isBeingEdited
                  ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                  : 'hover:border-primary/40'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-base text-foreground truncate">
                      {profile.profileName}
                    </h3>
                    {profile.fullName && (
                      <p className="text-sm text-muted-foreground">
                        {profile.fullName}
                      </p>
                    )}
                    {profile.title && (
                      <p className="text-xs font-semibold text-primary mt-1">
                        {profile.title}
                      </p>
                    )}
                  </div>
                  {profile.showPhoto && profile.photoUrl && (
                    <img
                      src={profile.photoUrl}
                      alt={profile.fullName}
                      className="h-16 w-16 rounded-md object-cover border border-border/80 shadow-xs shrink-0"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                </div>

                <div className="mt-3 space-y-1.5 border-t pt-3 text-xs text-muted-foreground">
                  {profile.email && (
                    <p className="flex items-center gap-1.5">
                      <span>✉️</span>{' '}
                      <span className="truncate">{profile.email}</span>
                    </p>
                  )}
                  {profile.phone && (
                    <p className="flex items-center gap-1.5">
                      <span>📞</span> <span>{profile.phone}</span>
                    </p>
                  )}
                  {profile.location && (
                    <p className="flex items-center gap-1.5">
                      <span>📍</span> <span>{profile.location}</span>
                    </p>
                  )}
                </div>

                {/* Military Status Info */}
                {profile.militaryStatus &&
                  profile.militaryStatus !== 'None' && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs bg-muted/40 text-muted-foreground border border-border/60 py-1 px-2.5 rounded-full w-fit">
                      <span>🛡️</span>
                      <span>
                        {t(`militaryStatus.${profile.militaryStatus}`)}
                        {profile.militaryStatus === 'Postponed' &&
                          profile.militaryPostponedUntil && (
                            <>
                              :{' '}
                              {new Date(
                                profile.militaryPostponedUntil,
                              ).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                              })}
                            </>
                          )}
                      </span>
                    </div>
                  )}

                {/* Languages List */}
                {profile.languages && profile.languages.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {profile.languages.map((lang) => (
                      <span
                        key={lang}
                        className="text-[10px] font-bold tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/10"
                      >
                        🌐 {lang}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons: Edit & Delete */}
              <div className="mt-4 pt-3 border-t flex items-center justify-end gap-2">
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={deleteMutation.isPending}
                    onClick={() => onEdit(profile)}
                    className="h-8 px-3 text-xs gap-1.5 cursor-pointer hover:bg-blue-500 hover:text-white dark:hover:bg-blue-500"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>{t('editProfile') || 'Düzenle'}</span>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={deleteMutation.isPending}
                  onClick={() => handleDelete(profile.id)}
                  className="h-8 px-2.5 text-xs gap-1.5 cursor-pointer text-destructive hover:bg-destructive hover:text-destructive-foreground
                  dark:text-red-400 dark:hover:text-white dark:hover:bg-red-500 disabled:opacity-70"
                >
                  {isDeletingThis ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Siliniyor...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>{t('deleteProfile') || 'Sil'}</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
