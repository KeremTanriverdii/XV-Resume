"use client"

import { createContext,useContext,useEffect,useState } from "react"
import { createClient } from "@/utils/supabase/client";
import {User,Session} from "@supabase/supabase-js";
import { AuthContextType } from "@/types";


const AuthContext = createContext<AuthContextType>({
    user:null,
    session:null,
    isLoading:true
});

export function AuthProvider ({children}: {children:React.ReactNode}) {
    const [user,setUser] = useState<User | null>(null);
    const [session,setSession] = useState<Session | null>(null);
    const [isLoading,setIsLoading] = useState<boolean>(true);
    
    // Create client
    const supabase = createClient();

    useEffect(()=>{
        // Get session from supabase for first time
        const checkSession = async()=>{
            const {data:{session}} = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setSession(session);
            setIsLoading(false);
        }
        checkSession();

        // Listen for auth changes
        const {data: {subscription}} = supabase.auth.onAuthStateChange((_event,session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
        }
    );

        return () => {
            subscription.unsubscribe();
        };
    },[]);
    return (
        <AuthContext.Provider value={{user,session,isLoading}}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    return useContext(AuthContext);
};