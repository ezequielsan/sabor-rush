'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Wallet, 
  ChevronLeft, 
  CheckCircle, 
  Loader2, 
  Receipt,
  AlertCircle,
  X 
} from 'lucide-react'
import { fecharConta } from '@/actions/mesas'

interface ItemResumo {
  nome: string
  quantidade: number
  total: number
}

interface FechamentoFormProps {
  mesa: { id: string; nome: string; numero: number }
  itens: ItemResumo[]
  totais: { subtotal: number; taxa: number; totalFinal: number }
}

export default function FechamentoForm({ mesa, itens, totais }: FechamentoFormProps) {
  const router = useRouter()
  const [metodoSelecionado, setMetodoSelecionado] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Estado para Feedback Visual (Toast)
  const [toast, setToast] = useState<{ show: boolean, msg: string, type: 'success' | 'error' }>({
    show: false, msg: '', type: 'success'
  })

  const metodos = [
    { id: 'CREDITO', label: 'Cartão de Crédito', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    { id: 'DEBITO', label: 'Cartão de Débito', icon: CreditCard, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
    { id: 'PIX', label: 'Pix', icon: Smartphone, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    { id: 'DINHEIRO', label: 'Dinheiro', icon: Banknote, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
  ]

  const formatarMoeda = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  async function handleConfirmarPagamento() {
    if (!metodoSelecionado) return
    setLoading(true)

    try {
      const resp = await fecharConta(mesa.id, metodoSelecionado)

      if (resp.sucesso) {
        // 1. Mostra mensagem de sucesso
        setToast({ show: true, msg: 'Pagamento confirmado! Mesa liberada.', type: 'success' })
        
        // 2. Aguarda 1.5s e redireciona para o Dashboard
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 1500)

      } else {
        setToast({ show: true, msg: resp.erro || 'Erro ao fechar conta', type: 'error' })
        setLoading(false)
      }
    } catch (error) {
       setToast({ show: true, msg: 'Erro de comunicação.', type: 'error' })
       setLoading(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-80px)] -m-6 bg-gray-50 relative">
      
      {/* --- TOAST DE FEEDBACK --- */}
      {toast.show && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border animate-in slide-in-from-top-5 duration-300 ${
          toast.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
          <div>
            <h4 className="font-bold">{toast.type === 'success' ? 'Sucesso!' : 'Erro!'}</h4>
            <p className="text-sm opacity-90">{toast.msg}</p>
          </div>
          <button onClick={() => setToast({ ...toast, show: false })} className="ml-4 opacity-50 hover:opacity-100">
            <X size={18} />
          </button>
        </div>
      )}

      {/* --- LADO ESQUERDO: RESUMO --- */}
      <div className="w-[400px] bg-white border-r border-gray-200 flex flex-col h-full shadow-lg z-10">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-800 flex items-center gap-2 mb-4 text-sm transition-colors">
            <ChevronLeft size={16} /> Voltar
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
               <Receipt size={24} />
            </div>
            <div>
                <h1 className="text-xl font-bold text-gray-900">Fechamento</h1>
                <p className="text-gray-500 text-sm">{mesa.nome}</p>
            </div>
          </div>
        </div>

        {/* Lista de Itens */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Extrato</p>
          {itens.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm py-2 border-b border-gray-50 last:border-0">
              <div>
                <span className="font-bold text-gray-900 mr-2">{item.quantidade}x</span>
                <span className="text-gray-600">{item.nome}</span>
              </div>
              <span className="font-medium text-gray-900">{formatarMoeda(item.total)}</span>
            </div>
          ))}
        </div>

        {/* Totais */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 space-y-3">
          <div className="flex justify-between text-gray-500 text-sm">
            <span>Subtotal</span>
            <span>{formatarMoeda(totais.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-500 text-sm">
            <span>Taxa de Serviço (10%)</span>
            <span>{formatarMoeda(totais.taxa)}</span>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <span className="text-lg font-bold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-gray-900">{formatarMoeda(totais.totalFinal)}</span>
          </div>
        </div>
      </div>

      {/* --- LADO DIREITO: PAGAMENTO --- */}
      <div className="flex-1 p-10 flex flex-col justify-center items-center overflow-y-auto">
        
        <div className="max-w-2xl w-full">
          <div className="mb-8 text-center">
             <h2 className="text-3xl font-bold text-gray-900 mb-2">Forma de Pagamento</h2>
             <p className="text-gray-500">Selecione como o cliente pagou na maquininha.</p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-10">
            {metodos.map((metodo) => (
              <button
                key={metodo.id}
                onClick={() => setMetodoSelecionado(metodo.id)}
                className={`
                  relative h-32 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all
                  hover:shadow-md active:scale-95
                  ${metodoSelecionado === metodo.id 
                    ? `${metodo.bg} ${metodo.border} ring-2 ring-offset-2 ring-orange-500` 
                    : 'bg-white border-gray-200 hover:border-orange-200'
                  }
                `}
              >
                <metodo.icon size={32} className={metodoSelecionado === metodo.id ? metodo.color : 'text-gray-400'} />
                <span className={`text-base font-bold ${metodoSelecionado === metodo.id ? 'text-gray-900' : 'text-gray-500'}`}>
                  {metodo.label}
                </span>
                
                {metodoSelecionado === metodo.id && (
                  <div className="absolute top-3 right-3 text-orange-500">
                    <CheckCircle size={20} />
                  </div>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={handleConfirmarPagamento}
            disabled={!metodoSelecionado || loading}
            className={`
              w-full py-5 rounded-xl font-bold text-xl flex items-center justify-center gap-3 transition-all shadow-lg
              ${!metodoSelecionado || loading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                : 'bg-green-600 hover:bg-green-700 text-white hover:-translate-y-1 shadow-green-200'
              }
            `}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" /> Finalizando...
              </>
            ) : (
              <>
                <Wallet /> Confirmar e Liberar Mesa
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  )
}