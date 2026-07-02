"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CreateProfileDto, Profile } from "@/types"
import { createProfile } from "@/services/profileService"

interface ProfileCreateFormProps {
  token: string | undefined
  userId: string | undefined
}

export default function ProfileCreateForm({ token, userId }: ProfileCreateFormProps) {
  const queryClient = useQueryClient()
  const [fullName, setFullName] = useState("")
  const [profileName, setProfileName] = useState("")

  const mutation = useMutation({
    mutationFn: (newProfile: CreateProfileDto) => createProfile(newProfile, token),
    
    // Optimistic Update
    onMutate: async (newProfile: CreateProfileDto) => {
      await queryClient.cancelQueries({ queryKey: ["profiles", userId] })

      // Backup old cache data
      const previousProfiles = queryClient.getQueryData<Profile[]>(["profiles", userId])

      // Update cache with new optimistic data
      queryClient.setQueryData(["profiles", userId], (old: Profile[] | undefined) => [
        ...(old || []),
        {
          id: "temp-id-" + Date.now(), // Temporary ID
          profileName: newProfile.profileName,
          fullName: newProfile.fullName,
          userId: userId,
          isOptimistic: true 
        } as unknown as Profile
      ])

      // Backup context to be passed to onError
      return { previousProfiles }
    },
    
    // Rollback optimistic update on error
    onError: (err, newProfile, context) => {
      if (context?.previousProfiles) {
        queryClient.setQueryData(["profiles", userId], context.previousProfiles)
      }
    },
    
    // After success or error, invalidate the cache and fetch fresh data
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles", userId] })
    },
    
    // After success, clear the form
    onSuccess: () => {
      setFullName("")
      setProfileName("")
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !userId) return

    const payload = {
      profileName: profileName || `${fullName}'s Profile`,
      fullName,
      title: "",
      email: "",
      phone: "",
      summary: "",
      skills: [],
      socialLinks: []
    }

    mutation.mutate(payload)
  }

  return (
    <div className="space-y-4 border rounded-lg p-4 max-w-lg bg-card text-card-foreground">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          Profil Oluştur
        </h3>
        {mutation.isPending && (
          <span className="text-xs text-muted-foreground animate-pulse">Kaydediliyor...</span>
        )}
        {mutation.isError && (
          <span className="text-xs text-destructive">Hata oluştu! Geri çekildi.</span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className="w-full border rounded px-3 py-2 text-sm bg-background"
          placeholder="Tam İsim"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <input
          className="w-full border rounded px-3 py-2 text-sm bg-background"
          placeholder="Profil İsmi (Örn: Türkçe CV)"
          value={profileName}
          onChange={(e) => setProfileName(e.target.value)}
        />
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-primary text-primary-foreground rounded px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
        >
          {mutation.isPending ? "Ekleniyor..." : "Profil Ekle"}
        </button>
      </form>
    </div>
  )
}
