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
    <div className="grid gap-4 md:grid-cols-2">
      {profiles.map((profile: Profile) => (
        <div key={profile.id} className="p-4 border rounded-lg shadow-xs bg-card text-card-foreground">
          <h3 className="font-semibold text-base">{profile.profileName}</h3>
          {profile.fullName && <p className="text-sm text-muted-foreground">{profile.fullName}</p>}
          {profile.title && <p className="text-xs font-medium text-primary mt-1">{profile.title}</p>}
          {profile.email && <p className="text-xs text-muted-foreground mt-2">✉️ {profile.email}</p>}
          {profile.phone && <p className="text-xs text-muted-foreground">📞 {profile.phone}</p>}
        </div>
      ))}
    </div>
  )
}