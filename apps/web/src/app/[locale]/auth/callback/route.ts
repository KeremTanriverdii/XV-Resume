import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ locale: string }> | { locale: string } }
) {
  const resolvedParams = await params;
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const locale = resolvedParams.locale ?? 'en'
  const next = searchParams.get('next') ?? `/${locale}/dashboard`


  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error(">>> Session exchange error:", error.message);
    } else {
      console.log(">>> Session exchanged successfully, redirecting to:", `${origin}${next}`);
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  console.log(">>> Redirecting to login with failure.");
  return NextResponse.redirect(`${origin}/${locale}/login?error=auth_failed`)
}
