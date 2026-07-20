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
  addSession: (session: ResumeSession) => void;
  removeSession: (id: string) => void;
  setSessions: (sessions: ResumeSession[]) => void;
  updateSessionTitle: (id: string, jobTitle: string) => void;
}

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => ({
      user: {
        name: 'Kerem Tanrıverdi',
        email: 'kerem@example.com',
        avatarUrl: 'https://github.com/shadcn.png', // Fallback Shadcn avatar
      },
      sessions: [],
      addSession: (session) =>
        set((state) => {
          const exists = state.sessions.some((s) => s.id === session.id);
          if (exists) {
            return {
              sessions: state.sessions.map((s) =>
                s.id === session.id ? { ...s, ...session } : s,
              ),
            };
          }
          return { sessions: [session, ...state.sessions] };
        }),
      removeSession: (id) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
        })),
      setSessions: (sessions) => set({ sessions }),
      updateSessionTitle: (id, jobTitle) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, jobTitle } : s,
          ),
        })),
    }),
    {
      name: 'resume-storage', // persists mock data to localStorage
    }
  )
);
