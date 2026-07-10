"use client"

import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter, DialogClose } from "../ui/dialog"
import { useState } from "react"
import { Input } from "../ui/input"
import { Plus } from "lucide-react"
import AutocompleteInput from "@/components/ui/autocomplete-input"
import { SCHOOL_NAMES, DEGREES, FIELDS_OF_STUDY } from "@/lib/autocomplete-data"
import { createEducation } from "@/services/educationService"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CreateEducationDto } from "@/types"

interface CreateEducationModalProps {
  token: string | undefined
  userId: string | undefined
}

export default function CreateEducationModal({ token, userId }: CreateEducationModalProps) {
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [schoolName, setSchoolName] = useState("")
  const [degree, setDegree] = useState("")
  const [fieldOfStudy, setFieldOfStudy] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isOngoing, setIsOngoing] = useState(false)
  const [gpa, setGpa] = useState("")

  const resetForm = () => {
    setSchoolName("")
    setDegree("")
    setFieldOfStudy("")
    setStartDate("")
    setEndDate("")
    setIsOngoing(false)
    setGpa("")
  }

  const createMutation = useMutation({
    mutationFn: (newEdu: CreateEducationDto) => createEducation(newEdu, token),
    onSuccess: () => {
      // Invalidate both educations list and form data
      queryClient.invalidateQueries({ queryKey: ['educations', userId] })
      queryClient.invalidateQueries({ queryKey: ['profileFormdata', userId] })
      resetForm()
      setIsOpen(false)
    }
  })

  const handleCreateEducation = (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    const payload: CreateEducationDto = {
      schoolName,
      degree,
      fieldOfStudy,
      startDate,
      endDate: isOngoing ? null : endDate,
      isOngoing,
      gpa: gpa || null
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
          Eğitim Ekle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Eğitim Bilgisi Ekle</DialogTitle>
          <DialogDescription>
            Yeni bir eğitim bilgisi ekleyin. Kaydettikten sonra listeden seçebilirsiniz.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateEducation} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="schoolName" className="text-right text-sm font-medium">Okul Adı <span className="text-destructive">*</span></label>
            <AutocompleteInput
              suggestions={SCHOOL_NAMES}
              className="col-span-3 bg-background"
              value={schoolName}
              onChange={setSchoolName}
              required
              placeholder="Örn: Boğaziçi Üniversitesi"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="degree" className="text-right text-sm font-medium">Derece <span className="text-destructive">*</span></label>
            <AutocompleteInput
              suggestions={DEGREES}
              className="col-span-3 bg-background"
              value={degree}
              onChange={setDegree}
              required
              placeholder="Örn: Lisans, Yüksek Lisans"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="fieldOfStudy" className="text-right text-sm font-medium">Bölüm <span className="text-destructive">*</span></label>
            <AutocompleteInput
              suggestions={FIELDS_OF_STUDY}
              className="col-span-3 bg-background"
              value={fieldOfStudy}
              onChange={setFieldOfStudy}
              required
              placeholder="Örn: Bilgisayar Mühendisliği"
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
                id="isOngoingEdu"
                checked={isOngoing}
                onChange={(e) => setIsOngoing(e.target.checked)}
                className="rounded border-input text-primary focus:ring-ring cursor-pointer"
              />
              <label htmlFor="isOngoingEdu" className="text-xs cursor-pointer select-none">
                Hala devam ediyorum
              </label>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="gpa" className="text-right text-sm font-medium">Ortalama</label>
            <Input
              type="text"
              id="gpa"
              className="col-span-3 bg-background"
              value={gpa}
              onChange={(e) => setGpa(e.target.value)}
              placeholder="Örn: 3.50 (İsteğe bağlı)"
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