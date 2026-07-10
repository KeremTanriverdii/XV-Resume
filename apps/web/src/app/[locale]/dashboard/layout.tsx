
import { ReactNode } from 'react';
import {
  SidebarProvider,

  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/providers/AppSidebar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
    

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
       <AppSidebar/>
        {/* Main Content */}
        <main className="flex-1 overflow-auto flex flex-col ">
          <SidebarTrigger/>
          {/* Header Mobile / Top Nav if needed */}
          <header className="flex h-14 gap-4 border-b bg-background/95 backdrop-blur px-4 lg:px-6 md:hidden">
            <span className="font-semibold">ResumeXCreator</span>
          </header>
          <div className="p-2 md:p-5 w-full">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
