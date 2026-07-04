"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link, useRouter, usePathname } from "@/i18n/routing"
import { useResumeStore } from "@/store/useResumeStore"
import { 
  LayoutDashboard, 
  LayoutTemplate, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Sun, 
  Moon, 
  Globe,
  Laptop,
  GraduationCap,
  Briefcase,
  FolderGit2
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useAuth } from "./AuthProvider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { useLocale, useTranslations } from "next-intl"

export function AppSidebar() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const { sessions } = useResumeStore()
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations()

  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch by waiting for client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  const toggleLanguage = () => {
    const nextLocale = locale === "tr" ? "en" : "tr"
    
    const cleanPath = pathname.startsWith(`/${locale}`)
      ? pathname.slice(locale.length + 1)
      : pathname

    router.replace(cleanPath || "/", { locale: nextLocale })
  }

  const navigateSidebarItem = [
    { name: t("sidebar.my-resumes"), href: "/dashboard", icon: LayoutDashboard },
    { name: t("sidebar.profiles"), href: "/dashboard/profiles", icon: LayoutTemplate },
    { name: t("sidebar.educations"), href: "/dashboard/educations", icon: GraduationCap },
    { name: t("sidebar.experiences"), href: "/dashboard/experiences", icon: Briefcase },
    { name: t("sidebar.projects"), href: "/dashboard/projects", icon: FolderGit2 },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="p-2">
        <span className="font-semibold text-lg text-primary">ResumeXCreator</span>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>{t("sidebar.menu")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigateSidebarItem.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild>
                    <Link href={item.href}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Session History */}
        <SidebarGroup>
          <SidebarGroupLabel>{t("sidebar.recent-resumes")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sessions.length === 0 ? (
                <div className="px-4 py-2 text-xs text-muted-foreground">{t("sidebar.no-recent-resumes")}</div>
              ) : (
                sessions.map((session) => (
                  <SidebarMenuItem key={session.id}>
                    <SidebarMenuButton asChild>
                      <Link href={`/dashboard/resume/${session.id}`}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        <span className="truncate">{session.jobTitle}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Profile & Settings Dropdown at Bottom */}
      <SidebarFooter className="p-2">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 text-left focus:outline-none hover:bg-accent hover:text-accent-foreground p-2 rounded-lg transition-colors cursor-pointer">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.user_metadata.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user.user_metadata.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden flex-1">
                  <span className="text-sm font-medium truncate">{user.user_metadata.name}</span>
                  <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                </div>
              </button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent className="w-56" align="end" side="top" sideOffset={8}>
           <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer">
                  {mounted ? (
                    theme === "dark" ? (
                      <Moon className="mr-2 h-4 w-4" />
                    ) : theme === "light" ? (
                      <Sun className="mr-2 h-4 w-4" />
                    ) : (
                      <Laptop className="mr-2 h-4 w-4" />
                    )
                  ) : (
                    <Sun className="mr-2 h-4 w-4" />
                  )}
                  <span>{t("settings.theme")}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent sideOffset={7}>
                    <DropdownMenuItem 
                      onClick={() => setTheme("light")} 
                      className={`cursor-pointer ${theme === "light" ? "bg-accent text-accent-foreground font-semibold" : ""}`}
                    >
                      <Sun className="mr-2 h-4 w-4" />
                      <span>{t("common.light")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setTheme("dark")} 
                      className={`cursor-pointer ${theme === "dark" ? "bg-accent text-accent-foreground font-semibold" : ""}`}
                    >
                      <Moon className="mr-2 h-4 w-4" />
                      <span>{t("common.dark")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setTheme("system")} 
                      className={`cursor-pointer ${theme === "system" ? "bg-accent text-accent-foreground font-semibold" : ""}`}
                    >
                      <Laptop className="mr-2 h-4 w-4" />
                      <span>{t("common.system")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              {/* Language Toggle */}
              <DropdownMenuItem onClick={toggleLanguage} className="cursor-pointer">
                <Globe className="mr-2 h-4 w-4" />
                <span>{locale === "tr" ? "English" : "Türkçe"}</span>
              </DropdownMenuItem>

                 {/* Settings */}
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="flex items-center w-full cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t("settings.title")}</span>
                </Link>
              </DropdownMenuItem>

              {/* Logout */}
              <DropdownMenuItem 
                onClick={handleLogout} 
                className="flex items-center w-full cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 dark:focus:bg-destructive/20"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t("auth.logout")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}