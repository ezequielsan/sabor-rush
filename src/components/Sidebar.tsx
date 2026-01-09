'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LogOut, 
  LayoutDashboard, 
  UtensilsCrossed, 
  ChefHat, 
  Users, 
  DollarSign, 
  ShoppingBag 
} from 'lucide-react'
import { realizarLogout } from '@/actions/auth'

const iconMap = {
  dashboard: LayoutDashboard,
  produtos: UtensilsCrossed,
  cozinha: ChefHat,
  usuarios: Users,
  financeiro: DollarSign,
  pedidos: ShoppingBag
}

// Exportamos para poder usar em outros lugares se precisar
export interface MenuItem {
  name: string
  iconName: keyof typeof iconMap
  path: string
}

interface SidebarProps {
  // CORREÇÃO: Adicionamos 'readonly' aqui para aceitar o array "as const"
  itens: readonly MenuItem[]
}

export function Sidebar({ itens }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await realizarLogout()
    router.push('/login')
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0 z-50">
      <div className="h-20 flex items-center px-8 border-b border-gray-100">
        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
          <span className="text-white font-bold">S</span>
        </div>
        <span className="text-xl font-bold text-gray-800">SaborRush</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {itens.map((item) => {
          const isActive = pathname === item.path
          
          const IconComponent = iconMap[item.iconName]

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {IconComponent && <IconComponent size={20} />}
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          Sair
        </button>
      </div>
    </aside>
  )
}