'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRightLeft, CheckCircle, ChevronLeft, Loader2, XCircle } from 'lucide-react'
// IMPORTANTE: Ajuste o caminho abaixo se seu arquivo for 'mesa.ts' ou 'mesas.ts'
import { transferirMesa } from '@/actions/mesas' 

interface TransferirMesaFormProps {
  mesaOrigem: { id: string, nome: string, numero: number }
  mesasLivres: any[]
}

export default function TransferirMesaForm({ mesaOrigem, mesasLivres }: TransferirMesaFormProps) {
  const router = useRouter()
  const [selecionada, setSelecionada] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ msg: string, tipo: 'erro' | 'sucesso' } | null>(null)

  async function handleConfirmar() {
    if (!selecionada) return
    setLoading(true)

    // Chama a SUA função existente no backend
    const resp = await transferirMesa(mesaOrigem.id, selecionada)

    if (resp.sucesso) {
      setFeedback({ msg: 'Mesa transferida com sucesso!', tipo: 'sucesso' })
      // Aguarda um pouco para o usuário ler a mensagem antes de sair
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 1500)
    } else {
      setFeedback({ msg: resp.erro || 'Erro ao transferir mesa', tipo: 'erro' })
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-5xl mx-auto py-6">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button 
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-800 flex items-center gap-2 mb-2 transition-colors"
          >
            <ChevronLeft size={20} /> Voltar
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Transferir Consumo</h1>
          <p className="text-gray-500">
            Movendo pedidos da <span className="font-bold text-gray-800">{mesaOrigem.nome}</span>
          </p>
        </div>
        
        {/* Indicador Visual da Troca */}
        <div className="hidden md:flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
           <div className="px-4 py-2 bg-gray-100 rounded-lg font-bold text-gray-700">
             {mesaOrigem.nome}
           </div>
           <ArrowRightLeft className="text-gray-400" />
           <div className={`px-4 py-2 rounded-lg font-bold transition-all ${
             selecionada 
               ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-500 ring-offset-2' 
               : 'bg-gray-50 text-gray-400 border border-dashed border-gray-300'
           }`}>
             {selecionada 
               ? mesasLivres.find(m => m.id === selecionada)?.nome 
               : 'Selecione o destino'
             }
           </div>
        </div>
      </div>

      {/* MENSAGEM DE ERRO/SUCESSO */}
      {feedback && (
        <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${feedback.tipo === 'sucesso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
           {feedback.tipo === 'sucesso' ? <CheckCircle size={20}/> : <XCircle size={20}/>}
           {feedback.msg}
        </div>
      )}

      {/* GRID DE SELEÇÃO DE MESAS */}
      <div className="flex-1 overflow-y-auto">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Escolha a Mesa de Destino (Livres)</h2>
        
        {mesasLivres.length === 0 ? (
           <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">Não há outras mesas livres no momento.</p>
           </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mesasLivres.map(mesa => (
              <button
                key={mesa.id}
                onClick={() => setSelecionada(mesa.id)}
                className={`
                  h-32 rounded-xl flex flex-col items-center justify-center p-4 border-2 transition-all relative
                  ${selecionada === mesa.id 
                    ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-md scale-[1.02]' 
                    : 'border-transparent bg-white text-gray-600 hover:border-gray-200 hover:shadow-sm'
                  }
                `}
              >
                <span className="text-2xl font-bold">{mesa.nome}</span>
                <span className="text-xs mt-2 font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">LIVRE</span>
                
                {selecionada === mesa.id && (
                  <div className="absolute top-2 right-2 text-orange-500">
                    <CheckCircle size={20} />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* RODAPÉ COM AÇÃO */}
      <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
        <button 
          onClick={() => router.back()}
          className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
          disabled={loading}
        >
          Cancelar
        </button>
        <button 
          onClick={handleConfirmar}
          disabled={!selecionada || loading}
          className={`
            px-8 py-3 rounded-xl text-white font-bold flex items-center gap-2 shadow-lg transition-all
            ${!selecionada || loading 
              ? 'bg-gray-300 cursor-not-allowed shadow-none' 
              : 'bg-gray-900 hover:bg-black hover:-translate-y-1'
            }
          `}
        >
          {loading ? <Loader2 className="animate-spin" /> : <ArrowRightLeft size={20} />}
          Confirmar Transferência
        </button>
      </div>

    </div>
  )
}