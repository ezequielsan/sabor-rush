import { buscarDadosDashboard } from '@/actions/mesas'
import { cookies } from 'next/headers'
import { User } from 'lucide-react'
import { MesasGrid } from '@/components/MesasGrid'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const session = cookieStore.get('sabor-session')?.value
  const usuario = session ? JSON.parse(session) : { nome: 'Usuário', perfil: 'Visitante' }

  const { dados } = await buscarDadosDashboard()
  const mesas = dados?.mesas || []
  const resumo = dados?.resumo || { totalMesas: 0, ocupadas: 0, livres: 0, faturamentoAberto: 0 }

  return (
    // FIX DE ROLAGEM AQUI:
    // 1. h-full: Ocupa toda a altura disponível
    // 2. overflow-y-auto: Cria a barra de rolagem SÓ AQUI dentro, se precisar
    // 3. pr-2: Um pequeno espaço na direita para a barra de rolagem não colar no conteúdo
    <div className="flex flex-col h-full overflow-y-auto pr-2"> 
      
      {/* --- HEADER --- */}
      <header className="flex justify-between items-center mb-10 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Visão Geral</h1>
          <p className="text-gray-500 mt-1">Acompanhe as mesas em tempo real</p>
        </div>

        <div className="flex items-center gap-4 bg-white px-5 py-2.5 rounded-full border border-gray-200 shadow-sm">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-gray-900">{usuario.nome}</p>
            <p className="text-xs text-gray-500 font-medium">{usuario.perfil}</p>
          </div>
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700">
            <User size={20} />
          </div>
        </div>
      </header>

      {/* --- CARDS DE RESUMO --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 shrink-0">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
          <p className="text-gray-500 mb-2 text-sm font-medium">Total de mesas</p>
          <p className="text-3xl font-normal text-gray-900">{resumo.totalMesas}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
          <p className="text-gray-500 mb-2 text-sm font-medium">Mesas ocupadas</p>
          <p className="text-3xl font-normal text-gray-900">{resumo.ocupadas}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
          <p className="text-gray-500 mb-2 text-sm font-medium">Mesas livres</p>
          <p className="text-3xl font-normal text-gray-900">{resumo.livres}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
          <p className="text-gray-500 mb-2 text-sm font-medium">Faturamento aberto</p>
          <p className="text-3xl font-normal text-gray-900">
             {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(resumo.faturamentoAberto)}
          </p>
        </div>
      </div>

      {/* --- GRID INTERATIVO --- */}
      <div className="flex-1">
         <MesasGrid mesas={mesas} />
      </div>
      
    </div>
  )
}