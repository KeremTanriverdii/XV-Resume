import { User, Session } from "@supabase/supabase-js";

export type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
};

export type UserProfile = {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string;
    created_at: string;
};

export type Languages = "en" | "tr" | "de" | "es" | "jp" | "fr";
