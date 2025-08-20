import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Apenas proteger rotas /admin (exceto /admin que é a página de login)
  if (pathname.startsWith('/admin') && pathname !== '/admin') {
    const supabase = createMiddlewareClient({ req: request, res: NextResponse.next() })
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session?.user) {
        console.log('🔒 [MIDDLEWARE] Usuário não autenticado, redirecionando para login')
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      
      console.log('✅ [MIDDLEWARE] Usuário autenticado:', session.user.email)
    } catch (error) {
      console.error('❌ [MIDDLEWARE] Erro:', error)
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
