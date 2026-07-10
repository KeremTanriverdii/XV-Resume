"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import AutocompleteInput from "@/components/ui/autocomplete-input"
import { LOCATIONS, JOB_TITLES } from "@/lib/autocomplete-data"
import { useState } from "react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createExperience } from "@/services/experienceService"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CreateExperienceDto } from "@/types"

interface CreateExperienceModalProps {
  token: string | undefined
  userId: string | undefined
}

export default function CreateExperienceModal({ token, userId }: CreateExperienceModalProps) {
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [companyName, setCompanyName] = useState("")
  const [role, setRole] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [isOngoing, setIsOngoing] = useState(false)

  const resetForm = () => {
    setCompanyName("")
    setRole("")
    setStartDate("")
    setEndDate("")
    setDescription("")
    setLocation("")
    setLogoUrl("")
    setIsOngoing(false)
  }

  const createMutation = useMutation({
    mutationFn: (newExp: CreateExperienceDto) => createExperience(newExp, token),
    onSuccess: () => {
      // Invalidate both experiences list and form data
      queryClient.invalidateQueries({ queryKey: ['experiences', userId] })
      queryClient.invalidateQueries({ queryKey: ['profileFormdata', userId] })
      resetForm()
      setIsOpen(false)
    }
  })

  const handleCreateExperience = (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    const payload: CreateExperienceDto = {
      companyName,
      role,
      startDate,
      endDate: isOngoing ? null : endDate,
      isOngoing,
      description,
      location,
      logoUrl: logoUrl || undefined
    }

    createMutation.mutate(payload)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 px-2.5 text-xs flex items-center gap-1.5 cursor-pointer mt-2"
        >
          <Plus className="h-3.5 w-3.5" />
          Deneyim Ekle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Deneyim Ekle</DialogTitle>
          <DialogDescription>
            Yeni bir iş deneyimi ekleyin. Kaydettikten sonra listeden seçebilirsiniz.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateExperience} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="companyName" className="text-right text-sm font-medium">Şirket <span className="text-destructive">*</span></label>
            <Input
              type="text"
              id="companyName"
              className="col-span-3 bg-background"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              placeholder="Örn: Google"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="role" className="text-right text-sm font-medium">Rol <span className="text-destructive">*</span></label>
            <AutocompleteInput
              suggestions={JOB_TITLES}
              className="col-span-3 bg-background"
              value={role}
              onChange={setRole}
              required
              placeholder="Örn: Software Engineer"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="startDate" className="text-right text-sm font-medium">Başlangıç <span className="text-destructive">*</span></label>
            <Input
              type="date"
              id="startDate"
              className="col-span-3 bg-background"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="endDate" className="text-right text-sm font-medium">Bitiş</label>
            <Input
              type="date"
              id="endDate"
              className="col-span-3 bg-background"
              disabled={isOngoing}
              value={isOngoing ? "" : endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required={!isOngoing}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-start-2 col-span-3 flex items-center gap-2">
              <input
                type="checkbox"
                id="isOngoingExp"
                checked={isOngoing}
                onChange={(e) => setIsOngoing(e.target.checked)}
                className="rounded border-input text-primary focus:ring-ring cursor-pointer"
              />
              <label htmlFor="isOngoingExp" className="text-xs cursor-pointer select-none">
                Hala çalışıyorum
              </label>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="location" className="text-right text-sm font-medium">Konum</label>
            <AutocompleteInput
              suggestions={LOCATIONS}
              className="col-span-3 bg-background"
              value={location}
              onChange={setLocation}
              placeholder="Örn: İstanbul (Remote)"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="description" className="text-right text-sm font-medium">Açıklama</label>
            <textarea
              id="description"
              className="col-span-3 min-h-[80px] border rounded-md px-3 py-2 text-sm bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="İş tanımınız ve başarılarınız..."
            />
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">İptal</Button>
            </DialogClose>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
