'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  ArrowRightLeft, 
  DollarSign, 
  X 
} from 'lucide-react'

// Auxiliar de formatação
const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor)
}

interface MesasGridProps {
  mesas: any[]
}

export function MesasGrid({ mesas }: MesasGridProps) {
  const router = useRouter()
  const [mesaSelecionada, setMesaSelecionada] = useState<any | null>(null)

  // 1. Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh()
    }, 30000)
    return () => clearInterval(interval)
  }, [router])

  // Ações do Modal
  const handleAcao = (acao: string) => {
    if (!mesaSelecionada) return

    switch (acao) {
      case 'novo_pedido':
        router.push(`/dashboard/mesas/${mesaSelecionada.id}`)
        break
      case 'transferir':
        router.push(`/dashboard/mesas/${mesaSelecionada.id}/transferir`)
        break
      case 'fechar':
        // 2. Trava de segurança: Bloqueia se tiver pendência OU se o total for 0
        if (mesaSelecionada.pedidosNaoEntregues > 0) return 
        if (mesaSelecionada.total === 0) return // <--- Nova trava

        router.push(`/dashboard/mesas/${mesaSelecionada.id}/fechamento`)
        break
      default:
        break
    }
  }

  return (
    <>
      {/* --- GRID DE MESAS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
        {mesas.map((mesa) => {
          // Lógica de Cores Original
          let bgClass = "bg-[#E8F8EE] border-transparent"
          let statusLabel = "Livre"
          let textClass = "text-gray-900"

          if (mesa.status === 'OCUPADA') {
            bgClass = "bg-[#FDE8E8] border-transparent"
            statusLabel = "Ocupada"
          } else if (mesa.status === 'AGUARDANDO') {
             bgClass = "bg-[#FFF4E5] border-transparent"
             statusLabel = "Aguardando pedido"
          } else if (mesa.status === 'PAGAMENTO_PENDENTE') {
             bgClass = "bg-[#EBF5FF] border-transparent"
             statusLabel = "Solicitando Fechamento"
          }

          return (
            <div 
              key={mesa.id} 
              onClick={() => setMesaSelecionada(mesa)} // ABRE O MODAL
              className={`relative h-[320px] rounded-xl border flex flex-col items-center justify-center p-6 transition-transform hover:scale-[1.01] cursor-pointer ${bgClass}`}
            >
              <span className="absolute top-8 text-sm text-gray-600 font-medium">
                {statusLabel}
              </span>

              <h2 className={`text-4xl font-bold mb-8 ${textClass}`}>{mesa.nome}</h2>

              {mesa.status !== 'LIVRE' && (
                <div className="w-48 pt-6 border-t border-gray-400/30 text-center space-y-2">
                  <p className="text-sm font-medium text-gray-600">{mesa.tempo}</p>
                  <p className="text-xl font-bold text-gray-900">{formatarMoeda(mesa.total)}</p>
                  <p className="text-sm text-gray-500">{mesa.qtdPedidos} Pedidos</p>                
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* --- MODAL / POPUP --- */}
      {mesaSelecionada && (
        <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header do Modal */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{mesaSelecionada.nome}</h2>
                <p className="text-gray-500 text-sm mt-1">Escolha uma ação para essa mesa</p>
              </div>
              <button 
                onClick={() => setMesaSelecionada(null)}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Lista de Ações */}
            <div className="p-6 space-y-4">
              
              {/* Botão 1: Criar Pedido */}
              <button 
                onClick={() => handleAcao('novo_pedido')}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all group text-left"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 group-hover:bg-white group-hover:shadow-sm">
                  <Plus size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Criar Novo Pedido</h3>
                  <p className="text-xs text-gray-500">Escolha uma ação para essa mesa</p>
                </div>
              </button>

              {/* Botão 2: Transferir */}
              <button 
                onClick={() => handleAcao('transferir')}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all group text-left"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 group-hover:bg-white group-hover:shadow-sm">
                  <ArrowRightLeft size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Transferir Consumo</h3>
                  <p className="text-xs text-gray-500">Mover itens para outra mesa</p>
                </div>
              </button>

              {/* Botão 4: Fechar Conta */}
              <button 
                onClick={() => handleAcao('fechar')}
                disabled={mesaSelecionada.pedidosNaoEntregues > 0 || mesaSelecionada.total === 0}
                className={`
                  w-full flex items-center gap-4 p-4 rounded-xl border transition-all group text-left
                  ${(mesaSelecionada.pedidosNaoEntregues > 0 || mesaSelecionada.total === 0)
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-70' // Estilo Bloqueado (Cinza)
                    : 'border-orange-200 bg-orange-50 hover:bg-orange-100 cursor-pointer' // Estilo Ativo (Laranja)
                  }
                `}
              >
                <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center shadow-sm
                    ${(mesaSelecionada.pedidosNaoEntregues > 0 || mesaSelecionada.total === 0) ? 'bg-gray-200 text-gray-400' : 'bg-white text-orange-600'}
                `}>
                  <DollarSign size={20} />
                </div>
                
                <div>
                  <h3 className={`font-bold ${(mesaSelecionada.pedidosNaoEntregues > 0 || mesaSelecionada.total === 0) ? 'text-gray-500' : 'text-gray-900'}`}>
                    Fechar Conta
                  </h3>
                  
                  {/* --- Mensagens de Aviso --- */}
                  {mesaSelecionada.pedidosNaoEntregues > 0 ? (
                    // Caso 1: Pendência na cozinha
                    <p className="text-xs text-red-600 font-bold flex items-center gap-1 animate-pulse">
                       ⚠️ {mesaSelecionada.pedidosNaoEntregues} itens na cozinha
                    </p>
                  ) : mesaSelecionada.total === 0 ? (
                    // Caso 2: Conta Zerada (Novo)
                    <p className="text-xs text-gray-400 font-medium">
                       Sem consumo registrado
                    </p>
                  ) : (
                    // Caso 3: Tudo OK
                    <p className="text-xs text-gray-600 font-medium">
                      Total: {formatarMoeda(mesaSelecionada.total)}
                    </p>
                  )}
                </div>
              </button>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setMesaSelecionada(null)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}