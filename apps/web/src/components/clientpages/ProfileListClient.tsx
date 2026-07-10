"use client"

import { Profile } from "@/types"
import { useQuery } from "@tanstack/react-query"
import { fetchProfiles } from "@/services/profileService"
import { useTranslations } from "next-intl"

interface ProfileListClientProps {
  token: string | undefined
  userId: string | undefined
}

export default function ProfileListClient({ token, userId }: ProfileListClientProps) {
  const t = useTranslations("profiles");
  const { data: profiles, isLoading, error } = useQuery({
    queryKey: ['profiles', userId], 
    queryFn: () => fetchProfiles(token),
    enabled: !!token && !!userId, 
  })

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">{t('loading')}</div>
  }

  if (error) {
    return <div className="text-sm text-destructive">{t('error')}</div>
  }

  if (!profiles || profiles.length === 0) {
    return (
      <div className="text-sm text-muted-foreground border border-dashed rounded-lg p-6 text-center">
        {t('notFound')}
      </div>
    )
  }
  return (
    <div className="overflow-y-auto h-full">
      <h1 className="text-3xl font-bold mb-6">Your Created Profiles</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {profiles.map((profile: Profile) => (
        <div key={profile.id} className="p-5 border rounded-2xl shadow-sm bg-card text-card-foreground flex gap-4 items-start relative group hover:border-primary/40 transition-all duration-300">
          <div className="flex-1 min-w-0">
            <div className="flex justify-between">
           <div>
              <h3 className="font-bold text-base text-foreground truncate">{profile.profileName}</h3>
              {profile.fullName && <p className="text-sm text-muted-foreground">{profile.fullName}</p>}
              {profile.title && <p className="text-xs font-semibold text-primary mt-1">{profile.title}</p>}
           </div>
          {profile.showPhoto && profile.photoUrl && (
            <img 
            src={profile.photoUrl} 
            alt={profile.fullName} 
            className="h-20 w-20 rounded-md object-cover border border-border/80 shadow-xs shrink-0 " 
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
            />
          )}
          </div>
            
            <div className="mt-3 space-y-1.5 border-t pt-3 text-xs text-muted-foreground">
              {profile.email && <p className="flex items-center gap-1.5"><span>✉️</span> <span className="truncate">{profile.email}</span></p>}
              {profile.phone && <p className="flex items-center gap-1.5"><span>📞</span> <span>{profile.phone}</span></p>}
              {profile.location && <p className="flex items-center gap-1.5"><span>📍</span> <span>{profile.location}</span></p>}
            </div>

            {/* Military Status Info */}
            {profile.militaryStatus && profile.militaryStatus !== "None" && (
              <div className="mt-3 flex items-center gap-1.5 text-xs bg-muted/40 text-muted-foreground border border-border/60 py-1 px-2.5 rounded-full w-fit">
                <span>🛡️</span>
                <span>
                  {t(`militaryStatus.${profile.militaryStatus}`)}
                  {profile.militaryStatus === "Postponed" && profile.militaryPostponedUntil && (
                    <>: {new Date(profile.militaryPostponedUntil).toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' })}</>
                  )}
                </span>
              </div>
            )}

            {/* Languages List */}
            {profile.languages && profile.languages.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                <p className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/10">Output Langs:</p>
                {profile.languages.map((lang) => (
                  <span key={lang} className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/10">
                    {lang}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
      </div>
    </div>
  )
}