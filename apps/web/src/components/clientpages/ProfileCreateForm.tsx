"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CreateProfileDto, Profile } from "@/types"
import { createProfile } from "@/services/profileService"
import { fetchEducations } from "@/services/educationService"
import { fetchExperiences } from "@/services/experienceService"
import { fetchProjects } from "@/services/projectService"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Globe, Info } from "lucide-react"
import Image from "next/image"
import { UserMetadata } from "@supabase/supabase-js"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { useLocale } from "next-intl"
import CreateExperienceModal from "./CreateExpreienceModal"
import CreateEducationModal from "./CreateEducetionModal"
// import CreateProjectModal from "./CreateProjectModal"
export interface ProfileCreateFormProps {
  token: string | undefined
  userId: string | undefined
  metaData?: UserMetadata
}

const getSocialIcon = (url: string) => {
  const normalized = (url || "").toLowerCase()
  if (normalized.includes("github.com")) return <Image src="/github.png" alt="Github" width={16} height={16} />
  if (normalized.includes("linkedin.com")) return <Image src="/linkedin.webp" alt="Linkedin" width={16} height={16} />
  if (normalized.includes("twitter.com") || normalized.includes("x.com")) return <Image src="/twitterx.jpg" alt="Twitter" width={16} height={16} />
  return <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
}

const languagesList = [
  { code: "tr", label: "Türkçe" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "jp", label: "日本語" },
]

export default function ProfileCreateForm({ token, userId, metaData }: ProfileCreateFormProps) {
  const queryClient = useQueryClient()
  const [fullName, setFullName] = useState(metaData?.full_name || metaData?.name || "")
  const [profileName, setProfileName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [title, setTitle] = useState("")
  const [email, setEmail] = useState(metaData?.email || "")
  const [phone, setPhone] = useState(metaData?.phone || "")
  const [location, setLocation] = useState(metaData?.location || "")
  const [summary, setSummary] = useState("")
  const [skillsInput, setSkillsInput] = useState("")
  const [socialLinks, setSocialLinks] = useState<string[]>([])
  const [photoBoolean, setPhotoBoolean] = useState(false)
  const locale = useLocale();
  // Selection states typed correctly as string arrays
  const [experienceId, setExperienceId] = useState<string[]>([])
  const [educationId, setEducationId] = useState<string[]>([])
  const [projectId, setProjectId] = useState<string[]>([])

  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([locale])

  // Combined fetch query with corrected destructuring mapping
  const { data: formData, isLoading } = useQuery({
    queryKey: ['profileFormdata', userId],
    queryFn: async () => {
      const [education, experience, projects] = await Promise.all([
        fetchEducations(token),
        fetchExperiences(token),
        fetchProjects(token)
      ])
      return { education, experience, projects }
    },
    enabled: !!token && !!userId
  })

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
      setFullName(metaData?.full_name || metaData?.name || "")
      setProfileName("")
      setTitle("")
      setEmail(metaData?.email || "")
      setPhone(metaData?.phone || "")
      setLocation(metaData?.location || "")
      setSummary("")
      setSkillsInput("")
      setSocialLinks([])
      setExperienceId([])
      setEducationId([])
      setProjectId([])
      setSelectedLanguages([locale])
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !userId) return

    const payload = {
      profileName: profileName || `${fullName}'s Profile`,
      fullName,
      title,
      email,
      phone,
      location,
      summary,
      skills: skillsInput.split(",").map(s => s.trim()).filter(Boolean),
      socialLinks: socialLinks.map(s => s.trim()).filter(Boolean),
      photoBoolean,
      experienceId,
      educationId,
      projectId
    }

    mutation.mutate(payload)
  }

  return (
    <div className="space-y-4 border rounded-lg p-6 max-w-xl bg-card text-card-foreground shadow-sm">
      <div className="flex items-center justify-between border-b pb-3">
        <h3 className="font-semibold text-lg tracking-wide text-foreground">
          Profil Oluştur
        </h3>
        {mutation.isPending && (
          <span className="text-xs text-muted-foreground animate-pulse">Kaydediliyor...</span>
        )}
        {mutation.isError && (
          <span className="text-xs text-destructive font-medium">Hata oluştu!</span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-between gap-2">
          <div className="space-y-2">
          <label className="text-sm font-medium">Profil İsmi</label>
          <Input
            className="w-full bg-background"
            placeholder="Örn: Türkçe CV, English Resume"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Oluşturulacak Diller</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between gap-2 text-sm font-normal cursor-pointer bg-background">
                    {selectedLanguages.length > 0
                      ? selectedLanguages.map(lang => languagesList.find(l => l.code === lang)?.label).join(", ")
                      : "Dil Seçin"}
                  </Button> 
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <DropdownMenuLabel>Diller</DropdownMenuLabel>
                  {languagesList.map((lang) => {
                    const isChecked = selectedLanguages.includes(lang.code)
                    return (
                      <DropdownMenuCheckboxItem
                        key={lang.code}
                        checked={isChecked}
                        onCheckedChange={() => {
                          if (isChecked) {
                            // En az bir dil seçili kalmalı
                            if (selectedLanguages.length > 1) {
                              setSelectedLanguages(selectedLanguages.filter((l) => l !== lang.code))
                            }
                          } else {
                            setSelectedLanguages([...selectedLanguages, lang.code])
                          }
                        }}
                      >
                        {lang.label}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>    
            </div>
        </div>

        
        <div className="space-y-2">
          <label className="text-sm font-medium">Tam İsim</label>
          <Input
            className="w-full bg-background"
            placeholder="Tam İsim"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>


        <div className="space-y-2">
          <label className="text-sm font-medium">Başlık</label>
          <Input
            className="w-full bg-background"
            placeholder="Örn: Kıdemli Yazılım Geliştirici"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">E-posta</label>
            <Input
              className="w-full bg-background"
              type="email"
              placeholder="e-posta@adresiniz.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Telefon</label>
            <Input
              className="w-full bg-background"
              placeholder="05xx xxx xx xx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Lokasyon</label>
            <Input
              className="w-full bg-background"
              placeholder="Örn: İstanbul, TR"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Özet (Summary)</label>
          <textarea
            className="w-full min-h-[80px] border rounded-md px-3 py-2 text-sm bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Kendinizden kısaca bahsedin..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Yetenekler (Virgülle ayırın)</label>
          <Input
            className="w-full bg-background"
            placeholder="React, TypeScript, Node.js"
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">Sosyal Medya Linkleri</label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs flex items-center gap-1.5 cursor-pointer"
              onClick={() => setSocialLinks([...socialLinks, ""])}
            >
              <Plus className="h-3.5 w-3.5" />
              Link Ekle
            </Button>
          </div>
          
          {socialLinks.length === 0 ? (
            <div className="text-xs text-muted-foreground bg-muted/10 p-3 border border-dashed rounded-md text-center">
              Henüz sosyal medya linki eklenmedi.
            </div>
          ) : (
            <div className="space-y-2">
              {socialLinks.map((link, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md border border-input bg-muted/20 shrink-0">
                    {getSocialIcon(link)}
                  </div>
                  <Input
                    className="flex-1 bg-background"
                    placeholder="Örn: github.com/username veya linkedin.com/in/username"
                    value={link}
                    onChange={(e) => {
                      const updated = [...socialLinks]
                      updated[idx] = e.target.value
                      setSocialLinks(updated)
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0 cursor-pointer"
                    onClick={() => {
                      const updated = socialLinks.filter((_, i) => i !== idx)
                      setSocialLinks(updated)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- EXPERIENCE CHECKBOX LIST --- */}
        <div className="space-y-2 pt-2 border-t">
          <label className="text-sm font-semibold text-foreground">Deneyimler</label>
          {isLoading ? (
            <div className="text-xs text-muted-foreground animate-pulse">Yükleniyor...</div>
          ) : !formData?.experience || formData.experience.length === 0 ? (
            <div className="text-xs text-muted-foreground bg-muted/10 p-4 border border-dashed rounded text-center flex flex-col items-center gap-2">
              <span>Kayıtlı deneyim bulunamadı.</span>
              <CreateExperienceModal token={token} userId={userId} />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border rounded-md p-3 bg-muted/20">
              {formData.experience.map((exp) => {
                const isSelected = experienceId.includes(exp.id)
                return (
                  <label
                    key={exp.id}
                    className={`flex items-start space-x-3 p-2 rounded-md border cursor-pointer transition-all hover:bg-accent ${
                      isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-background'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-ring focus:ring-offset-background cursor-pointer"
                      checked={isSelected}
                      onChange={() => {
                        if (isSelected) {
                          setExperienceId(experienceId.filter(id => id !== exp.id))
                        } else {
                          setExperienceId([...experienceId, exp.id])
                        }
                      }}
                    />
                    <div className="flex flex-col text-sm">
                      <span className="font-medium text-foreground">{exp.companyName}</span>
                      <span className="text-xs text-muted-foreground">{exp.role}</span>
                    </div>
                  </label>
                )
              })}
            </div>
          )}

          {/* Experience-less Project Recommendation Banner */}
          {experienceId.length === 0 && (
            <div className="flex items-start gap-2.5 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-md text-amber-800 dark:text-amber-400 text-xs mt-2">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">💡 Tavsiye: İş tecrübeniz yok mu?</span>
                Profilinize herhangi bir iş deneyimi bağlamadınız. Eğer henüz iş tecrübeniz yoksa, CV'nizi öne çıkarmak için projelerinizi ekleyip onları ön plana çıkarmayı düşünebilirsiniz!
              </div>
            </div>
          )}
        </div>

        {/* --- EDUCATION CHECKBOX LIST --- */}
        <div className="space-y-2 pt-2 border-t">
          <label className="text-sm font-semibold text-foreground">Eğitimler</label>
          {isLoading ? (
            <div className="text-xs text-muted-foreground animate-pulse">Yükleniyor...</div>
          ) : !formData?.education || formData.education.length === 0 ? (
            <div className="text-xs text-muted-foreground bg-muted/10 p-4 border border-dashed rounded text-center flex flex-col items-center gap-2">
              <span>Kayıtlı eğitim bulunamadı.</span>
              <CreateEducationModal token={token} userId={userId} />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border rounded-md p-3 bg-muted/20">
              {formData.education.map((edu) => {
                const isSelected = educationId.includes(edu.id)
                return (
                  <label
                    key={edu.id}
                    className={`flex items-start space-x-3 p-2 rounded-md border cursor-pointer transition-all hover:bg-accent ${
                      isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-background'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-ring focus:ring-offset-background cursor-pointer"
                      checked={isSelected}
                      onChange={() => {
                        if (isSelected) {
                          setEducationId(educationId.filter(id => id !== edu.id))
                        } else {
                          setEducationId([...educationId, edu.id])
                        }
                      }}
                    />
                    <div className="flex flex-col text-sm">
                      <span className="font-medium text-foreground">{edu.schoolName}</span>
                      <span className="text-xs text-muted-foreground">
                        {edu.degree} - {edu.fieldOfStudy}
                      </span>
                    </div>
                  </label>
                )
              })}
            </div>
          )}
        </div>

        {/* --- PROJECT CHECKBOX LIST --- */}
        <div className="space-y-2 pt-2 border-t">
          <label className="text-sm font-semibold text-foreground">Projeler</label>
          {isLoading ? (
            <div className="text-xs text-muted-foreground animate-pulse">Yükleniyor...</div>
          ) : !formData?.projects || formData.projects.length === 0 ? (
            <div className="text-xs text-muted-foreground bg-muted/10 p-2 border border-dashed rounded text-center">Kayıtlı proje bulunamadı.</div>
          ) : (
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border rounded-md p-3 bg-muted/20">
              {formData.projects.map((proj) => {
                const isSelected = projectId.includes(proj.id)
                return (
                  <label
                    key={proj.id}
                    className={`flex items-start space-x-3 p-2 rounded-md border cursor-pointer transition-all hover:bg-accent ${
                      isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-background'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-ring focus:ring-offset-background cursor-pointer"
                      checked={isSelected}
                      onChange={() => {
                        if (isSelected) {
                          setProjectId(projectId.filter(id => id !== proj.id))
                        } else {
                          setProjectId([...projectId, proj.id])
                        }
                      }}
                    />
                    <div className="flex flex-col text-sm">
                      <span className="font-medium text-foreground">{proj.title}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-xs">
                        {proj.description}
                      </span>
                    </div>
                  </label>
                )
              })}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-primary text-primary-foreground rounded-md px-4 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer shadow-sm mt-4"
        >
          {mutation.isPending ? "Ekleniyor..." : "Profil Ekle"}
        </button>
      </form>
    </div>
  )
}
