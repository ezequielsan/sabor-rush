import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Tenta ler o cookie que gravamos no login
  const session = request.cookies.get('sabor-session')?.value
  
  // Pega a rota que o usuário está tentando acessar
  const { pathname } = request.nextUrl

  // --- REGRA 1: Proteger rotas privadas ---
  // Se o usuário tentar acessar qualquer coisa que NÃO seja login, estáticos ou api
  // e NÃO tiver sessão, manda pro login.
  
  const rotasPublicas = ['/login', '/cadastro', '/']
  const ehRotaPublica = rotasPublicas.some(rota => pathname === rota)

  // Se a rota não é pública e não tem sessão -> Login
  if (!ehRotaPublica && !session) {
    // Ignora arquivos estáticos (imagens, css, etc) para não travar o carregamento
    if (pathname.includes('.')) {
        return NextResponse.next()
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // --- REGRA 2: Redirecionar se já estiver logado ---
  // Se o usuário tem sessão e tenta acessar /login, manda pro dashboard
  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Se passou por tudo, deixa carregar a página
  return NextResponse.next()
}

// Configuração: Diz ao Next.js quais rotas devem passar pelo middleware
export const config = {
  matcher: [
    /*
     * Aplica o middleware em todas as rotas, EXCETO:
     * - api (rotas de API)
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagens)
     * - favicon.ico (ícone do navegador)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}