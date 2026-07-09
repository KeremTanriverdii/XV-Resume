"use client";
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useProfiles } from "@/hooks/useProfile"
import { useState, useEffect } from "react"
import { Check, Loader2, Mail, Phone, MapPin, Sparkles, FolderGit2, Link2, X } from "lucide-react"
import { Experience } from "@/types";
import { useTranslations } from "next-intl"

export function SelectProfile({
  token,
  selectedProfileId,
  onSelect
}: {
  token: string | undefined
  selectedProfileId: string | null
  onSelect: (id: string | null) => void
}) {
  const t = useTranslations("profiles");
  const { data: profiles, isLoading, error } = useProfiles(token!);
  const [tempSelectedId, setTempSelectedId] = useState<string | null>(selectedProfileId);

  // Keep state in sync with external changes
  useEffect(() => {
    setTempSelectedId(selectedProfileId);
  }, [selectedProfileId]);

  if (isLoading) {
    return (
      <Button variant="outline" disabled className="w-full max-w-xl gap-2 rounded-full py-6">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t('loading')}
      </Button>
    )
  }

  if (error) {
    return <div className="text-sm text-destructive font-medium w-full max-w-xl text-center py-4 border border-dashed rounded-2xl">{t('error')}</div>
  }

  if (!profiles || profiles.length === 0) {
    return (
      <Button variant="outline" disabled className="w-full max-w-xl rounded-full py-6">
        {t('notFound')}
      </Button>
    )
  }

  const selectedProfile = profiles.find(p => p.id === selectedProfileId);

  return (
    <Sheet>
      <SheetTrigger asChild>
        {selectedProfile ? (
          <div className="w-full max-w-xl cursor-pointer group/card text-left">
            <div className="relative flex flex-col border border-border/80 rounded-2xl p-6 bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
              
              {/* Deselect / Reset Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={(e) => {
                  e.stopPropagation(); // Prevent opening the sheet
                  onSelect(null);
                }} 
                className="absolute top-4 right-4 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors cursor-pointer"
                title={t('notFound')}
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Profile Badge & Name */}
              <div className="mb-4">
                <span className="inline-flex items-center text-xs font-semibold bg-primary/10 text-primary mb-2 px-2 py-0.5 rounded-full">
                  {t('profileName')}: {selectedProfile.profileName}
                </span>
                <h3 className="text-xl font-bold tracking-tight text-foreground group-hover/card:text-primary transition-colors">
                  {selectedProfile.fullName}
                </h3>
                {selectedProfile.title && (
                  <p className="text-sm font-medium text-primary mt-1">
                    {selectedProfile.title}
                  </p>
                )}
              </div>

              {/* Contact Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 py-3 border-y border-border/50 text-xs text-muted-foreground">
                {selectedProfile.email && (
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                    <span className="truncate">{selectedProfile.email}</span>
                  </div>
                )}
                {selectedProfile.phone && (
                  <div className="flex items-center gap-2 truncate">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                    <span className="truncate">{selectedProfile.phone}</span>
                  </div>
                )}
                {selectedProfile.location && (
                  <div className="flex items-center gap-2 sm:col-span-2 truncate">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                    <span className="truncate">{selectedProfile.location}</span>
                  </div>
                )}
              </div>

              {/* Summary */}
              {selectedProfile.summary && (
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground line-clamp-2 italic border-l-2 border-primary/30 pl-3 leading-relaxed">
                    {selectedProfile.summary}
                  </p>
                </div>
              )}

              {/* Skills Badges */}
              {selectedProfile.skills && selectedProfile.skills.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground w-full mb-1">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    <span>{t('skills')}</span>
                  </div>
                  {selectedProfile.skills.slice(0, 6).map((skill, idx) => (
                    <span 
                      key={idx} 
                      className="px-2 py-0.5 bg-muted text-muted-foreground text-[10px] font-medium rounded-md border border-border/60"
                    >
                      {skill}
                    </span>
                  ))}
                  {selectedProfile.skills.length > 6 && (
                    <span className="text-[10px] text-muted-foreground font-medium pl-1 self-center">
                      +{selectedProfile.skills.length - 6} {t('more')}
                    </span>
                  )}
                </div>
              )}

              {/* Projects Summary */}
              {selectedProfile.projects && selectedProfile.projects.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground w-full mb-1">
                    <FolderGit2 className="h-3 w-3 text-blue-500" />
                    <span>{t('projects')}</span>
                  </div>
                  {selectedProfile.projects.slice(0, 3).map((project: any, idx: number) => (
                    <span 
                      key={idx} 
                      className="px-2 py-0.5 bg-blue-500/5 text-blue-600 dark:text-blue-400 text-[10px] font-medium rounded-md border border-blue-500/10"
                    >
                      {project.title}
                    </span>
                  ))}
                  {selectedProfile.projects.length > 3 && (
                    <span className="text-[10px] text-muted-foreground font-medium pl-1 self-center">
                      +{selectedProfile.projects.length - 3} {t('more')}
                    </span>
                  )}
                </div>
              )}

              {/* Social Links Summary */}
              {selectedProfile.socialLinks && selectedProfile.socialLinks.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground w-full mb-1">
                    <Link2 className="h-3 w-3 text-cyan-500" />
                    <span>{t('links')}</span>
                  </div>
                  {selectedProfile.socialLinks.map((link: string, idx: number) => {
                    let label = link;
                    try {
                      const url = new URL(link.startsWith('http') ? link : `https://${link}`);
                      label = url.hostname.replace('www.', '');
                    } catch {}
                    return (
                      <span 
                        key={idx} 
                        className="px-2 py-0.5 bg-cyan-500/5 text-cyan-600 dark:text-cyan-400 text-[10px] font-medium rounded-md border border-cyan-500/10 max-w-[120px] truncate"
                        title={link}
                      >
                        {label}
                      </span>
                    );
                  })}
                </div>
              )}
              
              <div className="mt-5 text-right w-full">
                <span className="text-[10px] font-semibold text-primary group-hover/card:underline">
                  {t('changeProfile')} &rarr;
                </span>
              </div>
            </div>
          </div>
        ) : (
          <Button variant="outline" className="w-full max-w-xl rounded-full py-6 border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 transition-all text-base cursor-pointer">
            + {t('selectProfileForResume')}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="flex flex-col h-full w-[400px] sm:w-[440px]">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle>{t('selectProfileForResume')}</SheetTitle>
          <SheetDescription>
            {t('selectProfileDesc')}
          </SheetDescription>
        </SheetHeader>
        
        {/* Scrollable list container */}
        <div className="flex-1 overflow-y-auto my-6 pr-2 gap-4 flex flex-col min-h-0 p-1">
          {profiles.map((profile) => {
            const isSelected = tempSelectedId === profile.id;
            return (
              <button
                key={profile.id}
                type="button"
                onClick={() => setTempSelectedId(profile.id)}
                className={`w-full text-left p-4 border rounded-2xl transition-all hover:bg-muted/50 cursor-pointer flex items-center justify-between group ${
                  isSelected 
                    ? "border-primary bg-primary/5 ring-1 ring-primary" 
                    : "border-border bg-card"
                }`}
              >
                <div className="flex-1 pr-4 overflow-hidden">
                  <h4 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
                    {profile.profileName}
                  </h4>
                  {profile.fullName && (
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {profile.fullName}
                    </p>
                  )}
                  {profile.title && (
                    <p className="text-xs font-medium text-primary mt-1 truncate">
                      {profile.title}
                    </p>
                  )}
                  {profile.experiences?.map((exp: Experience, idx: number) => (
                    <p key={idx} className="text-xs font-medium text-primary mt-1 truncate">
                      {exp.companyName}
                    </p>
                  ))}
                  
                  
                </div>
                {isSelected && (
                  <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground animate-in zoom-in-50 duration-200">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <SheetFooter className="pt-4 border-t gap-2 sm:gap-0 mt-auto">
          <SheetClose asChild>
            <Button 
              type="button" 
              onClick={() => onSelect(tempSelectedId)}
              className="w-full sm:w-auto"
            >
              {t('confirmSelection')}
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
