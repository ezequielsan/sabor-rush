'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { atualizarStatusPedido, buscarPedidosCozinha } from '@/actions/pedidos'

interface CozinhaBoardProps {
  pedidosIniciais: any[]
}

export default function CozinhaBoard({ pedidosIniciais }: CozinhaBoardProps) {
  const router = useRouter()
  const [pedidos, setPedidos] = useState<any[]>(pedidosIniciais)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [agora, setAgora] = useState(new Date())

  // 1. Relógio: Atualiza o tempo relativo (ex: "10 min") a cada minuto
  useEffect(() => {
    const timer = setInterval(() => setAgora(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // 2. Polling: Busca novos pedidos no banco a cada 30 segundos
  useEffect(() => {
    const intervalId = setInterval(async () => {
      const resp = await buscarPedidosCozinha()
      if (resp.sucesso && resp.dados) {
        setPedidos(resp.dados)
      }
    }, 30000)
    return () => clearInterval(intervalId)
  }, [])

  // 3. Função de avançar status (Recebido -> Preparo -> Pronto -> Entregue)
  async function handleAvancarStatus(pedidoId: string, statusAtual: string) {
    setLoadingAction(pedidoId)
    
    let novoStatus: 'EM_PREPARO' | 'PRONTO' | 'ENTREGUE'
    
    if (statusAtual === 'RECEBIDO' || statusAtual === 'PREPARANDO') novoStatus = 'EM_PREPARO'
    else if (statusAtual === 'EM_PREPARO') novoStatus = 'PRONTO'
    else if (statusAtual === 'PRONTO') novoStatus = 'ENTREGUE'
    else {
        setLoadingAction(null)
        return
    }

    const res = await atualizarStatusPedido(pedidoId, novoStatus)
    
    if (res.sucesso) {
      if (novoStatus === 'ENTREGUE') {
        // Remove da tela se foi entregue
        setPedidos(prev => prev.filter(p => p.id !== pedidoId))
      } else {
        // Atualiza o status localmente
        setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, status: novoStatus } : p))
      }
      router.refresh()
    } else {
      alert('Erro ao atualizar status.')
    }
    setLoadingAction(null)
  }

  // Calcula minutos passados desde a criação
  function calcularTempo(dataString: string) {
    const diff = agora.getTime() - new Date(dataString).getTime()
    return Math.floor(diff / 60000)
  }

  // Filtra os pedidos para cada coluna
  const recebidos = pedidos.filter(p => p.status === 'RECEBIDO' || p.status === 'PREPARANDO')
  const preparo = pedidos.filter(p => p.status === 'EM_PREPARO')
  const prontos = pedidos.filter(p => p.status === 'PRONTO')

  // --- SUBCOMPONENTE: Card do Pedido ---
  const CardPedido = ({ pedido, cor, btnTexto, btnCor, onClick }: any) => {
    const minutos = calcularTempo(pedido.dataCriacao)
    const corTempo = minutos > 45 ? 'text-red-600 font-bold' : 'text-gray-500'

    return (
      <div className={`mb-3 animate-in fade-in zoom-in duration-300 rounded-xl border-l-4 bg-white p-4 shadow-sm ${cor}`}>
        {/* Cabeçalho do Card */}
        <div className="mb-3 flex items-start justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wide text-gray-500">Mesa {pedido.mesa.numero}</span>
            <h3 className="text-lg font-bold text-gray-900">#{pedido.id.slice(0, 4)}</h3>
          </div>
          <span className={`text-sm font-medium ${corTempo}`}>{minutos} min</span>
        </div>

        {/* Lista de Itens */}
        <div className="mb-5 space-y-2">
          {pedido.itens.map((item: any) => (
            <div key={item.id} className="border-b border-dashed border-gray-100 pb-1 text-sm last:border-0 last:pb-0">
              <div className="flex items-start gap-2">
                <span className="min-w-[24px] rounded bg-gray-100 px-1.5 text-center font-bold text-gray-800">{item.quantidade}x</span>
                <span className="leading-tight text-gray-700">{item.produto.nome}</span>
              </div>
              {item.observacao && (
                <p className="ml-8 mt-0.5 inline-block rounded bg-orange-50 p-1 text-xs font-medium text-orange-600">
                  Obs: {item.observacao}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Botão de Ação */}
        <button 
          onClick={() => onClick(pedido.id, pedido.status)} 
          disabled={loadingAction === pedido.id} 
          className={`flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold shadow-sm transition-all hover:brightness-110 active:scale-95 ${btnCor}`}
        >
          {loadingAction === pedido.id ? <Loader2 className="animate-spin" size={18} /> : btnTexto}
        </button>
      </div>
    )
  }

  // --- RENDERIZAÇÃO PRINCIPAL ---
  return (
    <div className="flex h-full flex-col">
      
      {/* 1. Área de Resumo (Cards Superiores - Fixos) */}
      <div className="mb-4 grid flex-shrink-0 grid-cols-4 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-400">Total</p>
          <p className="text-3xl font-bold text-gray-900">{pedidos.length}</p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-blue-900 shadow-sm">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider opacity-70">Fila</p>
          <p className="text-3xl font-bold">{recebidos.length}</p>
        </div>
        <div className="rounded-2xl border border-yellow-100 bg-yellow-50 p-4 text-yellow-900 shadow-sm">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider opacity-70">Fogão</p>
          <p className="text-3xl font-bold">{preparo.length}</p>
        </div>
        <div className="rounded-2xl border border-green-100 bg-green-50 p-4 text-green-900 shadow-sm">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider opacity-70">Prontos</p>
          <p className="text-3xl font-bold">{prontos.length}</p>
        </div>
      </div>

      {/* 2. Área das Colunas (Kanban - Flexível com Rolagem) */}
      {/* min-h-0 é essencial para o scroll funcionar dentro do grid */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 md:grid-cols-3">
        
        {/* COLUNA 1: RECEBIDOS */}
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 p-3 shadow-inner">
          <div className="mb-3 flex flex-shrink-0 items-center gap-2 px-1">
            <div className="h-3 w-3 rounded-full bg-blue-500 shadow-sm"></div>
            <h2 className="font-bold text-gray-700">Recebido <span className="ml-1 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-xs text-gray-500">{recebidos.length}</span></h2>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-thin">
            {recebidos.map(p => (
              <CardPedido 
                key={p.id} 
                pedido={p} 
                cor="border-l-blue-500" 
                btnTexto="Iniciar Preparo" 
                btnCor="bg-blue-600 text-white" 
                onClick={handleAvancarStatus} 
              />
            ))}
            {recebidos.length === 0 && (
                <div className="m-2 flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-sm italic text-gray-400">
                    Fila vazia
                </div>
            )}
          </div>
        </div>

        {/* COLUNA 2: EM PREPARO */}
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-yellow-100 bg-yellow-50/50 p-3 shadow-inner">
          <div className="mb-3 flex flex-shrink-0 items-center gap-2 px-1">
            <div className="h-3 w-3 animate-pulse rounded-full bg-yellow-400 shadow-sm"></div>
            <h2 className="font-bold text-gray-800">Em Preparo <span className="ml-1 rounded-full border border-yellow-200 bg-white px-2 py-0.5 text-xs text-yellow-700">{preparo.length}</span></h2>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-thin">
            {preparo.map(p => (
              <CardPedido 
                key={p.id} 
                pedido={p} 
                cor="border-l-yellow-400" 
                btnTexto="Marcar Pronto" 
                btnCor="bg-yellow-500 text-white" 
                onClick={handleAvancarStatus} 
              />
            ))}
          </div>
        </div>

        {/* COLUNA 3: PRONTOS */}
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-green-100 bg-green-50/50 p-3 shadow-inner">
          <div className="mb-3 flex flex-shrink-0 items-center gap-2 px-1">
            <div className="h-3 w-3 rounded-full bg-green-500 shadow-sm"></div>
            <h2 className="font-bold text-gray-800">Pronto <span className="ml-1 rounded-full border border-green-200 bg-white px-2 py-0.5 text-xs text-green-700">{prontos.length}</span></h2>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-thin">
            {prontos.map(p => (
              <CardPedido 
                key={p.id} 
                pedido={p} 
                cor="border-l-green-500" 
                btnTexto="Entregar" 
                btnCor="bg-green-600 text-white" 
                onClick={handleAvancarStatus} 
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}