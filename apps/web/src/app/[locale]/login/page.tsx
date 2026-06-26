import GoogleLogin from "@/components/auth/GoogleLogin";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage(){
    return (
        <>
        <div className="flex min-h-screen items-center justify-center p-4 bg-background">
  <div className="w-full max-w-md">
    {/* Logo veya Başlık */}
    <div className="flex items-center justify-center gap-3 mb-8">
        <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-full border" />
        <span className="font-bold text-3xl tracking-tight">ResumeXCreator</span>
    </div>
    
    <div className="p-8 border rounded-2xl bg-card">
      <h1 className="text-center text-2xl font-bold mb-2">Hesabınıza Hoş Geldiniz</h1>
      <p className="text-center text-muted-foreground mb-6">Devam etmek için giriş yapın</p>

      {/* Google Login Butonu */}
      <div className="space-y-4">
        <GoogleLogin />

        {/* Alternatif Login Yöntemleri */}
        {/* <EmailLogin /> */}

        <p className="text-center text-sm text-muted-foreground">
          Hesabınız yok mu? <Link href="/register" className="text-primary font-medium">Kayıt olun</Link>
        </p>
      </div>
    </div>
  </div>
</div>
        </>
    )
}