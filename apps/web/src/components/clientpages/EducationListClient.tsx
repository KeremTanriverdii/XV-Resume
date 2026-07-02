"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Education, CreateEducationDto } from "@/types"
import { 
  fetchEducations, 
  createEducation, 
  updateEducation, 
  deleteEducation 
} from "@/services/educationService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Edit3, Plus, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { formatDate } from "@/utils/date"

interface EducationListClientProps {
  token: string | undefined
  userId: string | undefined
}

export default function EducationListClient({ token, userId }: EducationListClientProps) {
  const queryClient = useQueryClient()
  const t = useTranslations("educations")
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [schoolName, setSchoolName] = useState("")
  const [degree, setDegree] = useState("")
  const [fieldOfStudy, setFieldOfStudy] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [gpa, setGpa] = useState<string>("")
  const [isOngoing, setIsOngoing] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)

  // Fetch Query
  const { data: educations = [], isLoading, error } = useQuery({
    queryKey: ['educations', userId],
    queryFn: () => fetchEducations(token),
    enabled: !!token && !!userId
  })

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (newEdu: CreateEducationDto) => createEducation(newEdu, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educations', userId] })
      resetForm()
    }
  })

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateEducationDto }) => updateEducation(id, data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educations', userId] })
      resetForm()
    }
  })

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEducation(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educations', userId] })
    }
  })

  const resetForm = () => {
    setEditingId(null)
    setSchoolName("")
    setDegree("")
    setFieldOfStudy("")
    setStartDate("")
    setEndDate("")
    setGpa("")
    setIsOngoing(false)
    setIsFormOpen(false)
  }

  const handleEditClick = (edu: Education) => {
    setEditingId(edu.id)
    setSchoolName(edu.schoolName)
    setDegree(edu.degree)
    setFieldOfStudy(edu.fieldOfStudy)
    // Convert ISO string to YYYY-MM-DD for date inputs
    setStartDate(edu.startDate ? edu.startDate.split('T')[0] : "")
    setEndDate(edu.endDate ? edu.endDate.split('T')[0] : "")
    setGpa(edu.gpa || "")
    setIsOngoing(!edu.endDate)
    setIsFormOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    const payload = {
      schoolName,
      degree,
      fieldOfStudy,
      startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
      endDate: isOngoing || !endDate ? null : new Date(endDate).toISOString(),
      isOngoing,
      gpa: gpa || null
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
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{t("myEducations")}</h2>
        {!isFormOpen && (
          <Button onClick={() => setIsFormOpen(true)} size="sm" className="gap-2 cursor-pointer">
            <Plus size={16} /> {t("addEducation")}
          </Button>
        )}
      </div>

      {/* Form Card (Shadcn Card style) */}
      {isFormOpen && (
        <div className="rounded-xl border bg-card text-card-foreground shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-semibold text-sm tracking-wide text-foreground">
              {editingId ? t("editEducation") : t("newEducation")}
            </h3>
            <Button variant="ghost" size="icon" onClick={resetForm} className="h-8 w-8 cursor-pointer text-muted-foreground">
              <X size={18} />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">{t("schoolName")}</label>
                <Input 
                  placeholder={t("schoolPlaceholder")} 
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">{t("degree")}</label>
                <Input 
                  placeholder={t("degreePlaceholder")} 
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">{t("fieldOfStudy")}</label>
                <Input 
                  placeholder={t("fieldPlaceholder")} 
                  value={fieldOfStudy}
                  onChange={(e) => setFieldOfStudy(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">{t("gpa")}</label>
                <Input 
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  placeholder={t("gpaPlaceholder")} 
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value)}
                  disabled={isOngoing}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">{t("startDate")}</label>
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
                        const checked = e.target.checked
                        setIsOngoing(checked)
                        if (checked) {
                          setEndDate("")
                          setGpa("")
                        }
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
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={resetForm} className="cursor-pointer">
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="cursor-pointer">
                {editingId ? t("update") : t("addEducation")}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Grid List */}
      {educations.length === 0 ? (
        <div className="text-sm text-muted-foreground border border-dashed rounded-xl p-8 text-center bg-card/20">
          {t("noEducation")}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {educations.map((edu: Education) => (
            <div key={edu.id} className="rounded-xl border bg-card text-card-foreground shadow-xs p-5 flex flex-col justify-between hover:shadow-sm transition-shadow">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-base leading-tight text-foreground">{edu.schoolName}</h3>
                    <p className="text-sm text-primary font-medium mt-1">{edu.degree} - {edu.fieldOfStudy}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleEditClick(edu)} 
                      className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <Edit3 size={15} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deleteMutation.mutate(edu.id)} 
                      disabled={deleteMutation.isPending}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground flex flex-col gap-1 mt-2">
                  <span>📅 {formatDate(edu.startDate)} - {edu.isOngoing ? t("ongoing") : formatDate(edu.endDate)}</span>
                  {!edu.isOngoing && edu.gpa && <span>📊 {t("gpa")}: <strong>{edu.gpa}</strong> / 4.00</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
