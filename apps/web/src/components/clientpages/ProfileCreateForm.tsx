"use client"

import { useState, useRef, useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CreateProfileDto, Profile, MilitaryStatus } from "@/types"
import { createProfile } from "@/services/profileService"
import { fetchCurrentUser } from "@/services/userService"
import { fetchEducations } from "@/services/educationService"
import { fetchExperiences } from "@/services/experienceService"
import { fetchProjects } from "@/services/projectService"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Globe, Info } from "lucide-react"
import AutocompleteInput from "@/components/ui/autocomplete-input"
import TagInput from "@/components/ui/tag-input"
import PhoneInput from "@/components/ui/phone-input"
import { LOCATIONS, JOB_TITLES, SKILLS } from "@/lib/autocomplete-data"
import Image from "next/image"
import { UserMetadata } from "@supabase/supabase-js"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { createClient } from "@/utils/supabase/client"
import {
  Attachment,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
} from "@/components/ui/attachment"
import { useLocale, useTranslations } from "next-intl"
import CreateExperienceModal from "./CreateExpreienceModal"
import CreateEducationModal from "./CreateEducetionModal"
import { Field, FieldLabel } from "../ui/field"

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
  const t = useTranslations("profiles")
  const queryClient = useQueryClient()
  const [fullName, setFullName] = useState(metaData?.full_name || metaData?.name || "")
  const [profileName, setProfileName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [title, setTitle] = useState("")
  const [email, setEmail] = useState(metaData?.email || "")
  const [phone, setPhone] = useState(metaData?.phone || "")
  const [location, setLocation] = useState(metaData?.location || "")
  const [summary, setSummary] = useState("")
  const [skillsTags, setSkillsTags] = useState<string[]>([])
  const [socialLinks, setSocialLinks] = useState<string[]>([])
  const [showPhoto, setShowPhoto] = useState(false)
  const [photoUrl, setPhotoUrl] = useState("")
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "error" | "done">("idle")
  const [selectedFileName, setSelectedFileName] = useState("")
  const [selectedFileSize, setSelectedFileSize] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch current user details from DB to pre-fill location and phone
  const { data: userData } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => fetchCurrentUser(token),
    enabled: !!token,
  });

  useEffect(() => {
    if (userData) {
      if (!fullName) setFullName(userData.name || "");
      if (!phone) setPhone(userData.phone || "");
      if (!location) setLocation(userData.districtAndCityLocation || "");
    }
  }, [userData]);

  const [militaryStatus, setMilitaryStatus] = useState<string>("Default")
  const [militaryPostponedUntil, setMilitaryPostponedUntil] = useState<string>("")
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
      setSkillsTags([])
      setSocialLinks([])
      setExperienceId([])
      setEducationId([])
      setProjectId([])
      setSelectedLanguages([locale])
      setShowPhoto(true)
      setPhotoUrl("")
      setUploadState("idle")
      setSelectedFileName("")
      setSelectedFileSize("")
      setMilitaryStatus("None")
      setMilitaryPostponedUntil("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  })

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFileName(file.name)
    const sizeInKb = (file.size / 1024).toFixed(1)
    setSelectedFileSize(`${sizeInKb} KB`)
    setUploadState("uploading")

    try {
      const supabase = createClient()
      const fileExt = file.name.split(".").pop()
      const pathName = `${userId}/${Date.now()}.${fileExt}`

      const { data, error } = await supabase.storage
        .from("profile-photos")
        .upload(pathName, file, {
          cacheControl: "3600",
          upsert: true
        })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(pathName)

      setPhotoUrl(publicUrl)
      setUploadState("done")
    } catch (err) {
      console.error("Storage upload error:", err)
      setUploadState("error")
    }
  }

  const handleRemovePhoto = () => {
    setPhotoUrl("")
    setSelectedFileName("")
    setSelectedFileSize("")
    setUploadState("idle")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

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
      skills: skillsTags,
      socialLinks: socialLinks.map(s => s.trim()).filter(Boolean),
      showPhoto,
      photoUrl: photoUrl.trim() || undefined,
      militaryStatus: militaryStatus === "Default" ? undefined : (militaryStatus as MilitaryStatus),
      militaryPostponedUntil: militaryStatus === "Postponed" && militaryPostponedUntil 
        ? new Date(militaryPostponedUntil).toISOString()
        : null,
      experienceId,
      educationId,
      projectId,
      languages: selectedLanguages
    }

    mutation.mutate(payload)
  }

  return (
    <div className="w-full space-y-4 border rounded-lg p-6 bg-card text-card-foreground shadow-sm animate-in fade-in duration-200">
      <div className="flex items-center justify-between border-b pb-3">
        <h3 className="font-semibold text-lg tracking-wide text-foreground">
          {t('addProfile')}
        </h3>
        {mutation.isPending && (
          <span className="text-xs text-muted-foreground animate-pulse">{t('saving')}</span>
        )}
        {mutation.isError && (
          <span className="text-xs text-destructive font-medium">{t('createError')}</span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-between gap-2">
          <div className="space-y-2">
          <label className="text-sm font-medium">{t('profileName')} <span className="text-destructive">*</span></label>
          <Input
            className="w-full bg-background"
            placeholder={t('profileNamePlaceholder')}
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">{t('languagesToCreate')}</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between gap-2 text-sm font-normal cursor-pointer bg-background">
                    {selectedLanguages.length > 0
                      ? selectedLanguages.map(lang => languagesList.find(l => l.code === lang)?.label).join(", ")
                      : t('selectLanguage')}
                  </Button> 
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <DropdownMenuLabel>{t('languages')}</DropdownMenuLabel>
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
          <label className="text-sm font-medium">{t('name')} <span className="text-destructive">*</span></label>
          <Input
            className="w-full bg-background"
            placeholder={t('name')}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>


        <div className="space-y-2">
          <label className="text-sm font-medium">{t('titleLabel')}</label>
          <AutocompleteInput
            suggestions={JOB_TITLES}
            className="w-full bg-background"
            placeholder={t('titlePlaceholder')}
            value={title}
            onChange={setTitle}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('email')} <span className="text-destructive">*</span></label>
            <Input
              className="w-full bg-background"
              type="email"
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('phone')}</label>
            <PhoneInput
              value={phone}
              onChange={setPhone}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('location')}</label>
            <AutocompleteInput
              suggestions={LOCATIONS}
              className="w-full bg-background"
              placeholder={t('locationPlaceholder')}
              value={location}
              onChange={setLocation}
            />
          </div>
        </div>

        {/* Photo URL & Show Toggle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('showPhoto')}</label>
              <input
                type="checkbox"
                checked={showPhoto}
                onChange={(e) => setShowPhoto(e.target.checked)}
                className="h-4 w-4 rounded border-input text-primary focus:ring-ring cursor-pointer"
              />
            </div>
            {showPhoto && (
              <div className="space-y-2 mt-1 animate-in fade-in duration-200">
                <Field>
                  <Input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="w-full bg-background cursor-pointer mt-3"
                  />
                  {uploadState !== "idle" && (
                    <div className="pt-1.5 animate-in slide-in-from-top-1 duration-200">
                      <Attachment state={uploadState}>
                        <AttachmentMedia variant={uploadState === "done" ? "image" : "icon"}>
                          {uploadState === "done" ? (
                            <img 
                              src={photoUrl} 
                              alt="Profile Preview" 
                              className="h-full w-full object-cover rounded-lg aspect-square"
                              onError={(e) => {
                                console.error("Profile image load failed. Make sure the 'profile-photos' bucket in Supabase Storage is configured as PUBLIC.", photoUrl);
                              }}
                            />
                          ) : (
                            <Globe className="h-4 w-4 animate-pulse text-muted-foreground" />
                          )}
                        </AttachmentMedia>
                        <AttachmentContent>
                          <AttachmentTitle className="truncate max-w-[180px]">
                            {selectedFileName || "profile-photo.jpg"}
                          </AttachmentTitle>
                          <AttachmentDescription>
                            {uploadState === "uploading" ? "Uploading..." : uploadState === "error" ? "Upload Failed" : selectedFileSize}
                          </AttachmentDescription>
                        </AttachmentContent>
                        <AttachmentActions>
                          <AttachmentAction onClick={handleRemovePhoto}>
                            <Trash2 className="h-3 w-3" />
                          </AttachmentAction>
                        </AttachmentActions>
                      </Attachment>
                    </div>
                  )}
                </Field>
              </div>
            )}
          </div>

          {/* Military Status */}
          <Field className="space-y-2">
            <FieldLabel>{t('military')}</FieldLabel>
            <select
              value={militaryStatus}
              onChange={(e) => {
                const val = e.target.value;
                setMilitaryStatus(val);
                if (val !== "Postponed") {
                  setMilitaryPostponedUntil("");
                }
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="None">{t('militaryStatus.None')}</option>
              <option value="Default">{t('militaryStatus.Default')}</option>
              <option value="Completed">{t('militaryStatus.Completed')}</option>
              <option value="Postponed">{t('militaryStatus.Postponed')}</option>
              <option value="Exempt">{t('militaryStatus.Exempt')}</option>
            </select>

         {/* Conditional Date Picker for Military Postponed */}
        {militaryStatus === "Postponed" && (
          <div className="space-y-2 animate-in fade-in duration-200 ">
            <label className="text-sm font-medium">{t('militaryPostponed')}</label>
            <Input
              type="date"
              className="w-full bg-background"
              value={militaryPostponedUntil}
              onChange={(e) => setMilitaryPostponedUntil(e.target.value)}
              required={militaryStatus === "Postponed"}
            />
          </div>
        )}
          </Field>
        </div>


        <div className="space-y-2">
          <label className="text-sm font-medium">{t('summary')}</label>
          <textarea
            className="w-full min-h-[80px] border rounded-md px-3 py-2 text-sm bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder={t('summaryPlaceholder')}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t('skills')}</label>
          <TagInput
            suggestions={SKILLS}
            value={skillsTags}
            onChange={setSkillsTags}
            placeholder={t('skillsPlaceholder')}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">{t('socialLinksLabel')}</label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs flex items-center gap-1.5 cursor-pointer"
              onClick={() => setSocialLinks([...socialLinks, ""])}
            >
              <Plus className="h-3.5 w-3.5" />
              {t('addLink')}
            </Button>
          </div>
          
          {socialLinks.length === 0 ? (
            <div className="text-xs text-muted-foreground bg-muted/10 p-3 border border-dashed rounded-md text-center">
              {t('noSocialLinks')}
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
                    placeholder={t('socialLinkPlaceholder')}
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
          <label className="text-sm font-semibold text-foreground">{t('experiences')}</label>
          {isLoading ? (
            <div className="text-xs text-muted-foreground animate-pulse">{t('loading')}</div>
          ) : !formData?.experience || formData.experience.length === 0 ? (
            <div className="text-xs text-muted-foreground bg-muted/10 p-4 border border-dashed rounded text-center flex flex-col items-center gap-2">
              <span>{t('noExperiences')}</span>
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
                <span className="font-semibold block mb-0.5">{t('noExpBannerTitle')}</span>
                {t('noExpBannerDesc')}
              </div>
            </div>
          )}
        </div>

        {/* --- EDUCATION CHECKBOX LIST --- */}
        <div className="space-y-2 pt-2 border-t">
          <label className="text-sm font-semibold text-foreground">{t('educations')}</label>
          {isLoading ? (
            <div className="text-xs text-muted-foreground animate-pulse">{t('loading')}</div>
          ) : !formData?.education || formData.education.length === 0 ? (
            <div className="text-xs text-muted-foreground bg-muted/10 p-4 border border-dashed rounded text-center flex flex-col items-center gap-2">
              <span>{t('noEducations')}</span>
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
          <label className="text-sm font-semibold text-foreground">{t('projects')}</label>
          {isLoading ? (
            <div className="text-xs text-muted-foreground animate-pulse">{t('loading')}</div>
          ) : !formData?.projects || formData.projects.length === 0 ? (
            <div className="text-xs text-muted-foreground bg-muted/10 p-2 border border-dashed rounded text-center">{t('noProjects')}</div>
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
          {mutation.isPending ? t('btnSubmitPending') : t('btnSubmit')}
        </button>
      </form>
    </div>
  )
}
