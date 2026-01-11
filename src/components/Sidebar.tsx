'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  ChefHat, 
  Users, 
  UtensilsCrossed, 
  DollarSign, 
  LogOut 
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SidebarProps {
  // Recebe o perfil do usuário (pode vir do layout ou cookie)
  perfil: string 
}

export function Sidebar({ perfil }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  // Definição dos Itens de Menu com permissões
  const menuItems = [
    {
      label: 'Visão Geral',
      href: '/dashboard',
      icon: LayoutDashboard,
      // Admin, Garçom e Caixa veem as mesas. Cozinha NÃO vê.
      roles: ['ADMIN', 'GARCOM', 'CAIXA'] 
    },
    {
      label: 'Cozinha (KDS)',
      href: '/dashboard/cozinha',
      icon: ChefHat,
      // Admin, Garçom (para ver status) e Cozinha veem.
      roles: ['ADMIN', 'GARCOM', 'COZINHA']
    },
    {
      label: 'Fechamento',
      href: '/dashboard/caixa/fechamento',
      icon: DollarSign,
      // Apenas Admin e Caixa.
      roles: ['ADMIN', 'CAIXA']
    },
    {
      label: 'Produtos',
      href: '/dashboard/produtos',
      icon: UtensilsCrossed,
      // Apenas Admin (Garçom consome, mas não edita aqui).
      roles: ['ADMIN']
    },
    {
      label: 'Usuários',
      href: '/dashboard/usuarios',
      icon: Users,
      // Apenas Admin.
      roles: ['ADMIN']
    },
  ]

  // Filtra os itens baseado no perfil atual
  const itensVisiveis = menuItems.filter(item => item.roles.includes(perfil))

  const handleLogout = () => {
    // Apaga o cookie e redireciona
    document.cookie = "sabor-session=; path=/; max-age=0"
    router.push('/')
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0">
      
      {/* Logo */}
      <div className="h-20 flex items-center px-8 border-b border-gray-100">
        <div className="flex items-center gap-2 text-orange-600">
          <UtensilsCrossed size={28} strokeWidth={2.5} />
          <span className="text-xl font-extrabold tracking-tight">SaborRush</span>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {itensVisiveis.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium
                ${isActive 
                  ? 'bg-orange-50 text-orange-600 shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-gray-100">
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors font-medium"
        >
          <LogOut size={20} />
          Sair
        </button>
      </div>
    </aside>
  )
}