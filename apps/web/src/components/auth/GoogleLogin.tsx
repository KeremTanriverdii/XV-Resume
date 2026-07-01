"use client";

import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { useState } from "react";
import { useLocale } from "next-intl";

export default function GoogleLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const locale = useLocale();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    
    // Google login with supabase
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/${locale}/dashboard&locale=${locale}`,
      },
    });

    if (error) {
      console.error("Google giriş hatası:", error.message);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className="flex items-center justify-center gap-2 w-full px-4 py-2 border rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 transition-colors"
    >
      {/* İsterseniz buraya bir Google G logosu koyabilirsiniz */}
      {isLoading ? "Yönlendiriliyor..." : <><Image src="/googleLogo.png" alt="Google Logo" width={20} height={20} /> <p>Google ile Giriş Yap</p></>}
    </button>
  );
}
