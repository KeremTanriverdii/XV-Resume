"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Experience, CreateExperienceDto } from "@/types"
import { 
  fetchExperiences, 
  createExperience, 
  updateExperience, 
  deleteExperience 
} from "@/services/experienceService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Edit3, Plus, X } from "lucide-react"
import AutocompleteInput from "@/components/ui/autocomplete-input"
import { LOCATIONS, JOB_TITLES } from "@/lib/autocomplete-data"
import { useTranslations } from "next-intl"
import { formatDate } from "@/utils/date"

interface ExperienceListClientProps {
  token: string | undefined
  userId: string | undefined
}

export default function ExperienceListClient({ token, userId }: ExperienceListClientProps) {
  const queryClient = useQueryClient()
  const t = useTranslations("experiences")
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState("")
  const [role, setRole] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [description, setDescription] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [location, setLocation] = useState("")
  const [isOngoing, setIsOngoing] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)

  // Fetch Query
  const { data: experiences = [], isLoading, error } = useQuery({
    queryKey: ['experiences', userId],
    queryFn: () => fetchExperiences(token),
    enabled: !!token && !!userId
  })

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (newExp: CreateExperienceDto) => createExperience(newExp, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences', userId] })
      resetForm()
    }
  })

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateExperienceDto }) => updateExperience(id, data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences', userId] })
      resetForm()
    }
  })

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteExperience(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences', userId] })
    }
  })

  const resetForm = () => {
    setEditingId(null)
    setCompanyName("")
    setRole("")
    setStartDate("")
    setEndDate("")
    setDescription("")
    setLogoUrl("")
    setLocation("")
    setIsOngoing(false)
    setIsFormOpen(false)
  }

  const handleEditClick = (exp: Experience) => {
    setEditingId(exp.id)
    setCompanyName(exp.companyName)
    setRole(exp.role)
    setStartDate(exp.startDate ? exp.startDate.split('T')[0] : "")
    setEndDate(exp.endDate ? exp.endDate.split('T')[0] : "")
    setDescription(exp.description || "")
    setLogoUrl(exp.logoUrl || "")
    setLocation(exp.location || "")
    setIsOngoing(!exp.endDate)
    setIsFormOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    const payload = {
      companyName,
      role,
      startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
      endDate: isOngoing || !endDate ? null : new Date(endDate).toISOString(),
      isOngoing,
      description,
      logoUrl,
      location
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">{t("loading")}</div>
  }

  if (error) {
    return <div className="text-sm text-destructive">{t("error")}</div>
  }

  return (
    <div className="space-y-6">
      {/* Header and Toggle Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{t("myExperiences")}</h2>
        {!isFormOpen && (
          <Button onClick={() => setIsFormOpen(true)} size="sm" className="gap-2 cursor-pointer">
            <Plus size={16} /> {t("addExperience")}
          </Button>
        )}
      </div>

      {/* Form Card (Shadcn Card style) */}
      {isFormOpen && (
        <div className="rounded-xl border bg-card text-card-foreground shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-semibold text-sm tracking-wide text-foreground">
              {editingId ? t("editExperience") : t("newExperience")}
            </h3>
            <Button variant="ghost" size="icon" onClick={resetForm} className="h-8 w-8 cursor-pointer text-muted-foreground">
              <X size={18} />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">{t("companyName")} <span className="text-destructive">*</span></label>
                <Input 
                  placeholder={t("companyPlaceholder")} 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">{t("role")} <span className="text-destructive">*</span></label>
                <AutocompleteInput 
                  suggestions={JOB_TITLES}
                  placeholder={t("rolePlaceholder")} 
                  value={role}
                  onChange={setRole}
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">{t("location")}</label>
                <AutocompleteInput 
                  suggestions={LOCATIONS}
                  placeholder={t("locationPlaceholder")} 
                  value={location}
                  onChange={setLocation}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">{t("logoUrl")}</label>
                <Input 
                  placeholder={t("logoPlaceholder")} 
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">{t("startDate")} <span className="text-destructive">*</span></label>
                <Input 
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground">{t("endDate")}</label>
                  <label className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={isOngoing} 
                      onChange={(e) => {
                        setIsOngoing(e.target.checked)
                        if (e.target.checked) setEndDate("")
                      }}
                      className="rounded border-gray-300 text-primary focus:ring-primary h-3 w-3"
                    />
                    {t("ongoing")}
                  </label>
                </div>
                <Input 
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={isOngoing}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground">{t("description")}</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder={t("descPlaceholder")}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={resetForm} className="cursor-pointer">
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="cursor-pointer">
                {editingId ? t("update") : t("addExperience")}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Grid List */}
      {experiences.length === 0 ? (
        <div className="text-sm text-muted-foreground border border-dashed rounded-xl p-8 text-center bg-card/20">
          {t("noExperience")}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {experiences.map((exp: Experience) => (
            <div key={exp.id} className="rounded-xl border bg-card text-card-foreground shadow-xs p-5 flex flex-col justify-between hover:shadow-sm transition-shadow">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    {exp.logoUrl && (
                      <img 
                        src={exp.logoUrl} 
                        alt={`${exp.companyName} logo`} 
                        className="h-10 w-10 object-contain rounded border bg-white p-1"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-base leading-tight text-foreground">{exp.companyName}</h3>
                      <p className="text-sm text-primary font-medium mt-1">{exp.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleEditClick(exp)} 
                      className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <Edit3 size={15} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deleteMutation.mutate(exp.id)} 
                      disabled={deleteMutation.isPending}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground flex flex-col gap-1 mt-2">
                  <span>📅 {formatDate(exp.startDate)} - {exp.isOngoing ? t("ongoing") : formatDate(exp.endDate)}</span>
                  {exp.location && <span>📍 {exp.location}</span>}
                </div>

                {exp.description && (
                  <p className="text-sm text-muted-foreground mt-3 pt-3 border-t whitespace-pre-wrap leading-relaxed">
                    {exp.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
