"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Project, CreateProjectDto } from "@/types"
import { 
  fetchProjects, 
  createProject, 
  updateProject, 
  deleteProject 
} from "@/services/projectService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Edit3, Plus, X, ExternalLink } from "lucide-react"
import { useTranslations } from "next-intl"

interface ProjectListClientProps {
  token: string | undefined
  userId: string | undefined
}

export default function ProjectListClient({ token, userId }: ProjectListClientProps) {
  const queryClient = useQueryClient()
  const t = useTranslations("projects")
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [techologiesUsed, setTechologiesUsed] = useState("")
  const [links, setLinks] = useState("")
  const [repositoryUrl, setRepositoryUrl] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)

  // Fetch Query
  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['projects', userId],
    queryFn: () => fetchProjects(token),
    enabled: !!token && !!userId
  })

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (newProj: CreateProjectDto) => createProject(newProj, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', userId] })
      resetForm()
    }
  })

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateProjectDto }) => updateProject(id, data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', userId] })
      resetForm()
    }
  })

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProject(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', userId] })
    }
  })

  const resetForm = () => {
    setEditingId(null)
    setTitle("")
    setDescription("")
    setTechologiesUsed("")
    setLinks("")
    setRepositoryUrl("")
    setIsFormOpen(false)
  }

  const handleEditClick = (proj: Project) => {
    setEditingId(proj.id)
    setTitle(proj.title)
    setDescription(proj.description || "")
    setTechologiesUsed(proj.techologiesUsed || "")
    setLinks(proj.links || "")
    setRepositoryUrl(proj.repositoryUrl || "")
    setIsFormOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    const payload = {
      title,
      description,
      techologiesUsed,
      links,
      repositoryUrl
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
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{t("myProjects")}</h2>
        {!isFormOpen && (
          <Button onClick={() => setIsFormOpen(true)} size="sm" className="gap-2 cursor-pointer">
            <Plus size={16} /> {t("addProject")}
          </Button>
        )}
      </div>

      {/* Form Card (Shadcn Card style) */}
      {isFormOpen && (
        <div className="rounded-xl border bg-card text-card-foreground shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-semibold text-sm tracking-wide text-foreground">
              {editingId ? t("editProject") : t("newProject")}
            </h3>
            <Button variant="ghost" size="icon" onClick={resetForm} className="h-8 w-8 cursor-pointer text-muted-foreground">
              <X size={18} />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground">{t("projectTitle")}</label>
                <Input 
                  placeholder={t("projectTitlePlaceholder")} 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">{t("projectLink")}</label>
                <Input 
                  placeholder={t("projectLinkPlaceholder")} 
                  value={links}
                  onChange={(e) => setLinks(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">{t("repoUrl")}</label>
                <Input 
                  placeholder={t("repoPlaceholder")} 
                  value={repositoryUrl}
                  onChange={(e) => setRepositoryUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground">{t("techUsed")}</label>
                <Input 
                  placeholder={t("techPlaceholder")} 
                  value={techologiesUsed}
                  onChange={(e) => setTechologiesUsed(e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground">{t("description")}</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder={t("descPlaceholder")}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={resetForm} className="cursor-pointer">
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="cursor-pointer">
                {editingId ? t("update") : t("addProject")}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Grid List */}
      {projects.length === 0 ? (
        <div className="text-sm text-muted-foreground border border-dashed rounded-xl p-8 text-center bg-card/20">
          {t("noProject")}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((proj: Project) => (
            <div key={proj.id} className="rounded-xl border bg-card text-card-foreground shadow-xs p-5 flex flex-col justify-between hover:shadow-sm transition-shadow">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-base leading-tight text-foreground">{proj.title}</h3>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleEditClick(proj)} 
                      className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <Edit3 size={15} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deleteMutation.mutate(proj.id)} 
                      disabled={deleteMutation.isPending}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </div>

                {proj.techologiesUsed && (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {proj.techologiesUsed.split(',').map((tech: string, i: number) => (
                      <span key={i} className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded">
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {proj.description && (
                  <p className="text-sm text-muted-foreground mt-3 pt-3 border-t whitespace-pre-wrap leading-relaxed">
                    {proj.description}
                  </p>
                )}

                <div className="flex items-center gap-4 pt-3 mt-1 text-xs">
                  {proj.links && (
                    <a 
                      href={proj.links} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <ExternalLink size={13} /> {t("liveDemo")}
                    </a>
                  )}
                  {proj.repositoryUrl && (
                    <a 
                      href={proj.repositoryUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-1 text-muted-foreground hover:text-foreground hover:underline"
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                      {t("codeRepository")}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
