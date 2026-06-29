import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

 
export async function proxy (request: NextRequest) {
  // Match only internationalized pathnames
  const {pathname} = request.nextUrl;

  // 1. C# Backend Proxy
  if (pathname.startsWith('/api/v1')){
    const backendUrl = new URL(
      pathname,
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5075"
    )
    backendUrl.search = request.nextUrl.search
    return NextResponse.rewrite(backendUrl);
  }
  
  // 2. Supabasae Auth & Cookie Handler
  // helper function to request headers  
  let response = NextResponse.next({
      request: {headers: request.headers}
    });

    const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll(){
          return request.cookies.getAll();
        },
        setAll(cookiesToSet){
          cookiesToSet.forEach(({name,value}) => request.cookies.set(name,value));
          response = NextResponse.next({request})
          cookiesToSet.forEach(({name,value,options}) => 
        response.cookies.set(name,value,options)
      )
        }
      }
    }
  )

  // 3. Token Forwarding & Route Protection
  const {data: {user} } = await supabase.auth.getUser();
  if(pathname.startsWith('/dashboard') && !user){
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  };

  return response 
};
