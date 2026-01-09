import { buscarDadosDashboard } from '@/actions/mesas'
import { cookies } from 'next/headers'
import { User } from 'lucide-react'
import Link from 'next/link'

// Auxiliar para formatar moeda
const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor)
}

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const session = cookieStore.get('sabor-session')?.value
  const usuario = session ? JSON.parse(session) : { nome: 'Usuário', perfil: 'Visitante' }

  const { dados } = await buscarDadosDashboard()
  const mesas = dados?.mesas || []
  const resumo = dados?.resumo || { totalMesas: 0, ocupadas: 0, livres: 0, faturamentoAberto: 0 }

  return (
    <div className="flex flex-col h-full max-w-[1600px]"> 
      
      {/* --- HEADER --- */}
      <header className="flex justify-between items-center mb-10">
        {/* Título da Página (Esquerda) */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Visão Geral</h1>
          <p className="text-gray-500 mt-1">Acompanhe as mesas em tempo real</p>
        </div>

        {/* Perfil do Usuário (Direita) - SEM BOTÕES REDUNDANTES */}
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
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
             {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(resumo.faturamentoAberto)}
          </p>
        </div>
      </div>

      {/* --- GRID DE MESAS (3 COLUNAS) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
        {mesas.map((mesa) => {
          // Cores exatas para bater com o layout clean
          let bgClass = "bg-[#E8F8EE]" // Verde Livre
          let borderClass = "border-transparent" 
          let textStatus = "text-gray-700"
          let statusLabel = "Livre"

          if (mesa.status === 'OCUPADA') {
            bgClass = "bg-[#FDE8E8]" // Vermelho Ocupada
            statusLabel = "Ocupada"
            textStatus = "text-gray-800"
          } else if (mesa.status === 'AGUARDANDO') {
             bgClass = "bg-[#FFF4E5]" // Laranja
             statusLabel = "Aguardando pedido"
             textStatus = "text-gray-800"
          } else if (mesa.status === 'FECHAMENTO') {
             bgClass = "bg-[#EBF5FF]" // Azul
             statusLabel = "Solicitando Fechamento"
             textStatus = "text-gray-800"
          }

          return (
            // ENVOLVEMOS COM O LINK PARA A ROTA DINÂMICA
            <Link key={mesa.id} href={`/dashboard/mesas/${mesa.id}`}>
              <div 
                className={`relative h-[320px] rounded-xl border ${borderClass} flex flex-col items-center justify-center p-6 transition-transform hover:scale-[1.01] cursor-pointer ${bgClass}`}
              >
                <span className="absolute top-8 text-sm text-gray-600 font-medium">
                  {statusLabel}
                </span>

                <h2 className="text-4xl font-bold mb-8 text-gray-900">{mesa.nome}</h2>

                {mesa.status !== 'LIVRE' && (
                  <div className="w-48 pt-6 border-t border-gray-400/30 text-center space-y-2">
                    <p className="text-sm font-medium text-gray-600">{mesa.tempo}</p>
                    <p className="text-xl font-bold text-gray-900">{formatarMoeda(mesa.total)}</p>
                    <p className="text-sm text-gray-500">{mesa.itensCount} Pedidos</p>
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}