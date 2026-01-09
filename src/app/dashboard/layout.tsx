import { cookies } from 'next/headers'
import { Sidebar } from '@/components/Sidebar'

// Definição dos tipos para evitar erros de TypeScript
type Perfil = 'ADMIN' | 'GARCOM' | 'CAIXA' | 'COZINHA' | 'VISITANTE'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 1. Pega o perfil do usuário logado através do cookie
  const cookieStore = await cookies()
  const session = cookieStore.get('sabor-session')?.value
  const usuario = session ? JSON.parse(session) : undefined
  const perfil: Perfil = usuario?.perfil || 'VISITANTE'

  // 2. Lista completa com uma propriedade extra 'roles' (quem pode ver)
  const menuCompleto = [
    { 
      name: 'Visão Geral', 
      iconName: 'dashboard', 
      path: '/dashboard', 
      roles: ['ADMIN', 'GARCOM', 'CAIXA'] // Garçom precisa ver as mesas
    },
    { 
      name: 'Cozinha', 
      iconName: 'cozinha', 
      path: '/dashboard/cozinha', 
      roles: ['ADMIN', 'COZINHA'] 
    },
    { 
      name: 'Produtos', 
      iconName: 'produtos', 
      path: '/dashboard/produtos', 
      roles: ['ADMIN'] 
    },
    { 
      name: 'Financeiro', 
      iconName: 'financeiro', 
      path: '/dashboard/caixa', 
      roles: ['ADMIN', 'CAIXA'] // Garçom NÃO entra aqui
    },
    { 
      name: 'Equipe', 
      iconName: 'usuarios', 
      path: '/dashboard/usuarios', 
      roles: ['ADMIN'] 
    },
  ] as const

  // 3. Filtra os itens baseado no perfil atual
  // O TypeScript vai aceitar porque a estrutura é compatível com o Sidebar
  const itensPermitidos = menuCompleto.filter(item => 
    (item.roles as readonly string[]).includes(perfil)
  )

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      {/* Passamos apenas a lista filtrada */}
      <Sidebar itens={itensPermitidos} />

      <main className="flex-1 ml-64 p-10 bg-[#FAFAFA]">
        {children}
      </main>
    </div>
  )
}