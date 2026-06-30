"use client";

import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link"; 

export default function Navbar() {
  const { session, isLoading } = useAuth();

  return (
    <header className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between border-b border-border/40 backdrop-blur-md sticky top-0 z-50">
      <div className="font-bold text-2xl tracking-tight bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
        <Link href="/">ResumeXCreator</Link>
      </div>
      
      <nav className="flex items-center gap-6">
        {/* If user login */}
        {session ? (
          <>
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
              Dashboard
            </Link>
            <div className="text-sm text-muted-foreground">
              {session.user?.email}
            </div>
            {/* TODO: Maybe added logout button */}
          </>
        ) : (
          /* If not login */
          <>
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
              Giriş Yap
            </Link>
            <Link
              href="/register"
              className="hidden sm:inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-all"
            >
              Hemen Başla
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
