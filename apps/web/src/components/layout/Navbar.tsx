"use client";

import { Link, useRouter, usePathname } from "@/i18n/routing";
import { useAuth } from "@/providers/AuthProvider";
import { useLocale } from "next-intl";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Globe } from "lucide-react";
import { Button } from "../ui/button";

export default function Navbar() {
  const { session, isLoading } = useAuth();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLanguage = (lang: string) => {
      router.replace(pathname, { locale: lang as any });
  }

  const availableLanguages = [{
    name: "Türkçe",
    code: "tr",
  },{
    name: "English",
    code: "en",
  },{
    name: "Deutsch",
    code: "de",
  },{
    name: "Español",
    code: "es",
  },{
    name: "Français",
    code: "fr",
  },
    {
      name: "日本語",
      code: "jp",
    }
]

  return (
    <header className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between border-b border-border/40 backdrop-blur-md sticky top-0 z-50">
      <div className="font-bold text-2xl tracking-tight bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
        <Link href="/">ResumeXCreator</Link>
      </div>
      
      <nav className="flex items-center gap-6">
        {/* If user login */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='secondary' className="border-2">
              <Globe className="mr-2 h-4 w-4" />
              <span>{locale.toUpperCase()}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {availableLanguages.map((lang) => (
              <DropdownMenuItem key={lang.code} onClick={() => toggleLanguage(lang.code)}>
                <span>{lang.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {session ? (
          <>
            <Link href="/dashboard" locale={locale as any} className="text-sm font-medium hover:text-primary transition-colors">
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
