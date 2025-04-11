import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rotas públicas que não precisam de autenticação
const publicRoutes = ['/', '/auth']

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const pathname = request.nextUrl.pathname

  const isPublic = publicRoutes.includes(pathname)

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  if (token && pathname === '/auth') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// ⬇️ Aqui você define onde o middleware será executado
export const config = {
  matcher: [
    /*
     * Rodar em todas as rotas exceto:
     * - arquivos internos (_next)
     * - imagens
     * - favicon
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
