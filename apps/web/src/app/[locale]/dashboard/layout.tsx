'use client';

import { ReactNode } from 'react';
import { useResumeStore } from '../../../store/useResumeStore';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, LayoutDashboard, LayoutTemplate, Settings } from 'lucide-react';
import { Link } from '../../../i18n/routing';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, sessions } = useResumeStore();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <Sidebar>
          <SidebarHeader className="border-b p-4">
            <span className="font-semibold text-lg text-primary">ResumeXCreator</span>
          </SidebarHeader>

          <SidebarContent>
            {/* Main Navigation */}
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>My Resumes</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard/templates">
                        <LayoutTemplate className="mr-2 h-4 w-4" />
                        <span>Templates</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Session History */}
            <SidebarGroup>
              <SidebarGroupLabel>Recent Resumes</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sessions.length === 0 ? (
                    <div className="px-4 py-2 text-xs text-muted-foreground">No recent resumes.</div>
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

          {/* User Profile at Bottom */}
          <SidebarFooter className="border-t p-4">
            {user && (
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium truncate">{user.name}</span>
                  <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                </div>
              </div>
            )}
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <main className="flex-1 overflow-auto flex flex-col">
          {/* Header Mobile / Top Nav if needed */}
          <header className="flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur px-4 lg:px-6 md:hidden">
            <span className="font-semibold">ResumeXCreator</span>
          </header>
          <div className="flex-1 p-4 lg:p-6 w-full max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
