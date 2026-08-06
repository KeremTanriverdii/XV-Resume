import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const locale = searchParams.get('locale') ?? 'tr'
  const next = searchParams.get('next') ?? `/${locale}/dashboard`

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const redirectUrl = next.startsWith('/') ? `${origin}${next}` : next
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Hata varsa login sayfasına geri postala (locale ile birlikte)
  return NextResponse.redirect(`${origin}/${locale}/login?error=auth_failed`)
}
