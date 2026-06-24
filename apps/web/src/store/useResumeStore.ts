import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// TODO(Architecture): This Zustand store currently uses CSR (localStorage via persist).
// Once the Supabase/PostgreSQL backend is ready, we must refactor this to use 
// TanStack Query (React Query) SSR Hydration. We will fetch initial user & session 
// data on the Server Component and pass it down via <HydrationBoundary>.

export interface ResumeSession {
  id: string;
  jobTitle: string;
  jobLink: string;
  createdAt: string;
}

interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
}

interface ResumeStore {
  // Mock User Profile
  user: UserProfile | null;
  // History of created resumes (sessions)
  sessions: ResumeSession[];
  
  // Actions
  addSession: (jobLink: string) => void;
  removeSession: (id: string) => void;
}

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => ({
      user: {
        name: 'Kerem Tanrıverdi',
        email: 'kerem@example.com',
        avatarUrl: 'https://github.com/shadcn.png', // Fallback Shadcn avatar
      },
      sessions: [
        {
          id: '1',
          jobTitle: 'Senior Frontend Developer',
          jobLink: 'https://linkedin.com/jobs/view/12345',
          createdAt: new Date().toISOString(),
        }
      ],
      addSession: (jobLink) => set((state) => {
        // Mock job title generation (AI will replace this later)
        const mockTitle = jobLink.includes('linkedin') 
          ? 'LinkedIn Job Application' 
          : 'Software Engineer Application';
        
        const newSession: ResumeSession = {
          id: Math.random().toString(36).substring(2, 9),
          jobTitle: mockTitle,
          jobLink,
          createdAt: new Date().toISOString(),
        };
        
        return { sessions: [newSession, ...state.sessions] };
      }),
      removeSession: (id) => set((state) => ({
        sessions: state.sessions.filter(s => s.id !== id)
      })),
    }),
    {
      name: 'resume-storage', // persists mock data to localStorage
    }
  )
);
