'use client';

import { useState } from 'react';
import { useResumeStore } from '../../../store/useResumeStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Briefcase, ArrowRight } from 'lucide-react';
import { useRouter } from '../../../i18n/routing';

export default function DashboardPage() {
  const [jobLink, setJobLink] = useState('');
  const addSession = useResumeStore((state) => state.addSession);
  
  const handleStartResume = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobLink.trim()) return;
    
    // Add the job link to Zustand store (sidebar history)
    addSession(jobLink);
    setJobLink('');
    // The sidebar will instantly update thanks to Zustand.
  };

  return (
    <div className="flex flex-1 flex-col h-full gap-8 mt-12 lg:mt-20">
      <div className="flex flex-col items-center text-center gap-4 max-w-2xl mx-auto w-full">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2 shadow-inner">
          <Briefcase className="h-8 w-8" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Create a Tailored Resume</h1>
        <p className="text-lg text-muted-foreground">
          Paste the link to the job description you are applying for. Our AI will analyze the requirements and tailor your resume to perfectly match.
        </p>
        
        <form onSubmit={handleStartResume} className="mt-8 flex w-full max-w-xl flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Input 
              type="url" 
              placeholder="https://linkedin.com/jobs/view/..." 
              value={jobLink}
              onChange={(e) => setJobLink(e.target.value)}
              required
              className="w-full px-5 py-6 text-base rounded-full border-muted-foreground/30 shadow-sm focus-visible:ring-primary/50"
            />
          </div>
          <Button type="submit" size="lg" className="w-full sm:w-auto rounded-full py-6 px-8 shadow-md group transition-all hover:scale-105 active:scale-95">
            <span className="font-semibold text-base">Start AI</span>
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </form>
      </div>
      
      {/* Decorative Empty State Container */}
      <div className="mt-16 flex-1 rounded-3xl border-2 border-dashed border-border bg-muted/10 flex flex-col items-center justify-center p-12 text-center max-w-4xl mx-auto w-full">
         <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">✨</span>
         </div>
         <h3 className="font-semibold text-xl mb-2">Ready to generate</h3>
         <p className="text-sm text-muted-foreground max-w-md">
            Once you submit a job link above, the AI will process the details and start building your tailored resume. It will automatically appear in your sidebar history.
         </p>
      </div>
    </div>
  );
}
