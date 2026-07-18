"use client"
import GoogleLogin from "@/components/auth/GoogleLogin";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function LoginPage(){
    const t = useTranslations("login");
    return (
        <>
        <div className="flex min-h-screen items-center justify-center p-4 bg-background">
  <div className="w-full max-w-md">
    {/* Logo veya Başlık */}
    <div className="flex items-center justify-center gap-3 mb-8">
        <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-full border" />
        <span className="font-extrabold text-3xl tracking-tight text-zinc-900 dark:text-zinc-100">
          XV<span className="text-emerald-500 font-medium">Resume</span>
        </span>
    </div>
    
    <div className="p-8 border rounded-2xl bg-card">
      <h1 className="text-center text-2xl font-bold mb-2">{t('welcome')}</h1>
      <p className="text-center text-muted-foreground mb-6">{t('signInToContinue')}</p>

      {/* Google Login Butonu */}
      <div className="space-y-4">
        <GoogleLogin />

        {/* Alternatif Login Yöntemleri */}
        {/* <EmailLogin /> */}

        <p className="text-center text-sm text-muted-foreground">
          {t('dontHaveAccount')}{" "}
          <Link href="/register" className="text-primary font-medium">
            {t('signUp')}
          </Link>
        </p>
      </div>
    </div>
  </div>
</div>
        </>
    )
}