
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
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, LayoutDashboard, LayoutTemplate, Settings } from 'lucide-react';
import { Link } from '../../../i18n/routing';
import { AppSidebar } from '@/providers/AppSidebar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
    

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
       <AppSidebar/>
        {/* Main Content */}
        <main className="flex-1 overflow-auto flex flex-col">
          <SidebarTrigger/>
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
