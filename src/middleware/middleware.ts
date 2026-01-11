import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('sabor-session')?.value
  const { pathname } = request.nextUrl

  // 1. Se não estiver logado e tentar acessar dashboard, manda pro login
  if (!session && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Se estiver logado, verifica as permissões
  if (session) {
    const usuario = JSON.parse(session)
    const perfil = usuario.perfil // ADMIN, GARCOM, COZINHA, CAIXA

    // --- REGRAS DE ACESSO ---

    // A. COZINHA: Só pode acessar /dashboard/cozinha
    if (perfil === 'COZINHA') {
      if (!pathname.startsWith('/dashboard/cozinha')) {
        // Se tentar ir pra qualquer outro lugar, joga de volta pra cozinha
        return NextResponse.redirect(new URL('/dashboard/cozinha', request.url))
      }
    }

    // B. GARÇOM: Acessa Mesas (/dashboard) e Cozinha (/dashboard/cozinha)
    // Não pode acessar: Usuários, Produtos, Caixa
    if (perfil === 'GARCOM') {
      const rotasProibidas = ['/dashboard/usuarios', '/dashboard/produtos', '/dashboard/caixa']
      if (rotasProibidas.some(rota => pathname.startsWith(rota))) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // C. CAIXA: Acessa Mesas (/dashboard) e Caixa (/dashboard/caixa)
    // Não pode acessar: Usuários, Produtos, Cozinha (opcional, mas vou bloquear para focar)
    if (perfil === 'CAIXA') {
      const rotasProibidas = ['/dashboard/usuarios', '/dashboard/produtos', '/dashboard/cozinha']
      if (rotasProibidas.some(rota => pathname.startsWith(rota))) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // D. ADMIN: Acesso Total (Não precisa de if, passa direto)
  }

  return NextResponse.next()
}

// Configura em quais rotas o middleware roda
export const config = {
  matcher: ['/dashboard/:path*']
}