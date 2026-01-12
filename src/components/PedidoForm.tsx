'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, ChevronLeft, Tag, X, Minus, Plus, Trash2, 
  Loader2, CheckCircle, AlertCircle 
} from 'lucide-react'
import { criarPedido } from '@/actions/pedidos'

// Mock de Adicionais
const adicionaisMock = [
  { id: 'bacon', nome: 'Bacon Extra', preco: 4.00 },
  { id: 'queijo', nome: 'Queijo Extra', preco: 3.00 },
  { id: 'ovo', nome: 'Ovo', preco: 2.50 },
  { id: 'catupiry', nome: 'Catupiry', preco: 3.50 },
  { id: 'cheddar', nome: 'Cheddar', preco: 3.50 },
]

const removerMock = [
  { id: 'sem_cebola', nome: 'Sem Cebola' },
  { id: 'sem_tomate', nome: 'Sem Tomate' },
  { id: 'sem_alface', nome: 'Sem Alface' },
  { id: 'sem_maionese', nome: 'Sem Maionese' },
]

const formatarMoeda = (valor: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)

interface PedidoFormProps {
  mesaId: string
  produtos: any[]
  categorias: string[]
}

export default function PedidoForm({ mesaId, produtos, categorias }: PedidoFormProps) {
  const router = useRouter()
  
  // --- ESTADOS ---
  const [loading, setLoading] = useState(false)
  
  // Estado para Feedbacks (Toasts)
  const [toast, setToast] = useState<{ show: boolean, msg: string, type: 'success' | 'error' }>({
    show: false, msg: '', type: 'success'
  })

  const [busca, setBusca] = useState('')
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos')
  const [carrinho, setCarrinho] = useState<any[]>([])
  
  // Estado do Modal
  const [produtoSelecionado, setProdutoSelecionado] = useState<any | null>(null)
  const [adicionaisSelecionados, setAdicionaisSelecionados] = useState<string[]>([])
  const [removerSelecionados, setRemoverSelecionados] = useState<string[]>([])

  // --- HELPER DE NOTIFICAÇÃO ---
  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ show: true, msg, type })
    if (type === 'error') {
      setTimeout(() => setToast({ ...toast, show: false }), 4000)
    }
  }

  // --- LÓGICA DO CATÁLOGO ---
  const produtosFiltrados = produtos.filter(p => {
    const matchNome = p.nome.toLowerCase().includes(busca.toLowerCase())
    const matchCategoria = categoriaAtiva === 'Todos' || p.categoria === categoriaAtiva
    return matchNome && matchCategoria
  })

  // --- LÓGICA DO MODAL ---
  const abrirModal = (produto: any) => {
    setProdutoSelecionado(produto)
    setAdicionaisSelecionados([])
    setRemoverSelecionados([])
  }

  const fecharModal = () => setProdutoSelecionado(null)

  const toggleSelecao = (id: string, lista: string[], setLista: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (lista.includes(id)) {
      setLista(lista.filter(item => item !== id))
    } else {
      setLista([...lista, id])
    }
  }

  // --- LÓGICA DO CARRINHO ---
  const adicionarAoCarrinho = () => {
    if (!produtoSelecionado) return

    const precoAdicionais = adicionaisMock
      .filter(add => adicionaisSelecionados.includes(add.id))
      .reduce((acc, curr) => acc + curr.preco, 0)

    const novoItem = {
      idItem: Math.random().toString(36).substr(2, 9),
      produtoId: produtoSelecionado.id,
      nome: produtoSelecionado.nome,
      precoBase: Number(produtoSelecionado.preco),
      precoTotalUnitario: Number(produtoSelecionado.preco) + precoAdicionais,
      quantidade: 1,
      adicionais: adicionaisSelecionados,
      remover: removerSelecionados,
    }

    const itemExistenteIndex = carrinho.findIndex(item => 
      item.produtoId === novoItem.produtoId &&
      JSON.stringify(item.adicionais.sort()) === JSON.stringify(novoItem.adicionais.sort()) &&
      JSON.stringify(item.remover.sort()) === JSON.stringify(novoItem.remover.sort())
    )

    if (itemExistenteIndex >= 0) {
      const novoCarrinho = [...carrinho]
      novoCarrinho[itemExistenteIndex].quantidade += 1
      setCarrinho(novoCarrinho)
    } else {
      setCarrinho([...carrinho, novoItem])
    }

    fecharModal()
  }

  const atualizarQuantidade = (idItem: string, delta: number) => {
    setCarrinho(prevCarrinho => prevCarrinho.map(item => {
      if (item.idItem === idItem) {
        const novaQtd = item.quantidade + delta
        return novaQtd > 0 ? { ...item, quantidade: novaQtd } : item
      }
      return item
    }))
  }

  const removerDoCarrinho = (idItem: string) => {
    setCarrinho(prevCarrinho => prevCarrinho.filter(item => item.idItem !== idItem))
  }

  // --- ENVIO DO PEDIDO (ATUALIZADO COM FEEDBACK) ---
  async function handleEnviarPedido() {
    if (carrinho.length === 0) return

    setLoading(true)

    try {
        const itensParaEnviar = carrinho.map(item => {
            const nomesAdicionais = item.adicionais.map((id: string) => 
                adicionaisMock.find(a => a.id === id)?.nome || id
            )
            const nomesRemover = item.remover.map((id: string) => 
                removerMock.find(r => r.id === id)?.nome || id
            )

            const obsAdicionais = nomesAdicionais.length > 0 ? `Adic: ${nomesAdicionais.join(', ')}` : ''
            const obsRemover = nomesRemover.length > 0 ? `Sem: ${nomesRemover.join(', ')}` : ''
            const observacaoFinal = [obsAdicionais, obsRemover].filter(Boolean).join(' | ')

            return {
                produtoId: item.produtoId,
                quantidade: item.quantidade,
                observacao: observacaoFinal,
                precoUnitario: item.precoTotalUnitario
            }
        })

        const resultado = await criarPedido(mesaId, itensParaEnviar)

        if (resultado.sucesso) {
            showToast('Pedido enviado para a cozinha com sucesso!', 'success')
            
            setTimeout(() => {
              router.push('/dashboard')
              router.refresh()
            }, 1500)
            
        } else {
            showToast(resultado.erro || 'Erro ao criar pedido.', 'error')
            setLoading(false)
        }
    } catch (error) {
        console.error(error)
        showToast('Erro de conexão. Tente novamente.', 'error')
        setLoading(false)
    }
  }

  // --- CÁLCULOS FINAIS ---
  const subtotal = carrinho.reduce((acc, item) => acc + (item.precoTotalUnitario * item.quantidade), 0)
  const taxaServico = subtotal * 0.10
  const total = subtotal + taxaServico

  return (
    <div className="flex h-[calc(100vh-80px)] -m-10 relative">
      
      {/* --- COMPONENTE TOAST (FEEDBACK VISUAL) --- */}
      {toast.show && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border animate-in slide-in-from-top-5 duration-300 ${
          toast.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
          <div>
            <h4 className="font-bold">{toast.type === 'success' ? 'Sucesso!' : 'Atenção!'}</h4>
            <p className="text-sm opacity-90">{toast.msg}</p>
          </div>
          <button onClick={() => setToast({ ...toast, show: false })} className="ml-4 opacity-50 hover:opacity-100">
            <X size={18} />
          </button>
        </div>
      )}

      {/* --- MODAL --- */}
      {produtoSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{produtoSelecionado.nome}</h2>
                <p className="text-gray-500 text-sm">Personalize seu pedido</p>
              </div>
              <button onClick={fecharModal} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              <div>
                <h3 className="font-bold text-gray-800 mb-3">Adicionais</h3>
                <div className="space-y-2">
                  {adicionaisMock.map(add => (
                    <label key={add.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={adicionaisSelecionados.includes(add.id)} onChange={() => toggleSelecao(add.id, adicionaisSelecionados, setAdicionaisSelecionados)} className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500" />
                        <span className="text-gray-700 font-medium">{add.nome}</span>
                      </div>
                      <span className="text-gray-500 text-sm">+{formatarMoeda(add.preco)}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-3">Remover</h3>
                <div className="space-y-2">
                  {removerMock.map(rem => (
                    <label key={rem.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox" checked={removerSelecionados.includes(rem.id)} onChange={() => toggleSelecao(rem.id, removerSelecionados, setRemoverSelecionados)} className="w-5 h-5 rounded text-red-500 focus:ring-red-500" />
                      <span className="text-gray-700 font-medium">{rem.nome}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex gap-3">
              <button onClick={fecharModal} className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-100">Cancelar</button>
              <button onClick={adicionarAoCarrinho} className="flex-[2] py-3 bg-[#FF9933] hover:bg-[#E88D2E] text-white font-bold rounded-xl shadow-md shadow-orange-200">Adicionar ao Pedido</button>
            </div>
          </div>
        </div>
      )}

      {/* --- LADO ESQUERDO: CATÁLOGO --- */}
      <div className={`flex-1 flex flex-col bg-[#F3F4F6] border-r border-gray-200 transition-all ${produtoSelecionado ? 'blur-sm' : ''}`}>
        <div className="bg-white p-5 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium flex items-center gap-2 text-sm">
                   <ChevronLeft size={18} /> Voltar
                </button>
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Mesa {mesaId}</h1>
                    <p className="text-sm text-gray-500">Novo Pedido</p>
                </div>
            </div>
        </div>

        <div className="p-5 pb-2">
            <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="text" placeholder="Buscar Produtos..." className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-gray-700 placeholder:text-gray-400 shadow-sm" value={busca} onChange={e => setBusca(e.target.value)} />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categorias.map(cat => (
                    <button key={cat} onClick={() => setCategoriaAtiva(cat)} className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${categoriaAtiva === cat ? 'bg-orange-500 text-white shadow-md shadow-orange-200' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                        {cat}
                    </button>
                ))}
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 pt-2 scrollbar-hide">
            {produtos.length === 0 ? (
                 <div className="flex items-center justify-center h-full text-gray-400">Nenhum produto encontrado.</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {produtosFiltrados.map((produto: any) => (
                        <div key={produto.id} onClick={() => abrirModal(produto)} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col h-[260px] group">
                            <div className="w-full h-32 bg-gray-50 rounded-xl mb-4 flex items-center justify-center text-gray-300 group-hover:bg-orange-50/50 transition-colors">
                            <Tag size={32} />
                            </div>
                            <h3 className="font-bold text-lg text-gray-800 mb-1 line-clamp-1">{produto.nome}</h3>
                            <p className="text-sm text-gray-400 mb-3">{produto.categoria}</p>
                            <div className="mt-auto flex items-end justify-between">
                                <span className="text-xl font-bold text-gray-900">{formatarMoeda(Number(produto.preco))}</span>
                                <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-md">Personalizar</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* --- LADO DIREITO: RESUMO --- */}
      <div className={`w-[400px] bg-white flex flex-col h-full border-l border-gray-200 shadow-xl z-10 transition-all ${produtoSelecionado ? 'blur-sm' : ''}`}>
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-xl font-bold text-gray-900">Resumo</h2>
            <p className="text-gray-500 text-sm">{carrinho.reduce((acc, item) => acc + item.quantidade, 0)} itens na mesa</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide bg-gray-50">
            {carrinho.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center"><Tag size={24} /></div>
                    <p className="text-lg font-medium">Carrinho vazio</p>
                    <p className="text-sm">Selecione produtos ao lado</p>
                </div>
            ) : (
                carrinho.map((item) => (
                    <div key={item.idItem} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-gray-800 text-lg">{item.nome}</p>
                                {(item.adicionais.length > 0 || item.remover.length > 0) ? (
                                  <ul className="text-xs text-gray-500 mt-1 space-y-0.5">
                                    {item.adicionais.map((addId: string) => {
                                      const add = adicionaisMock.find(a => a.id === addId)
                                      return <li key={addId} className="text-green-600">+ {add?.nome}</li>
                                    })}
                                    {item.remover.map((remId: string) => {
                                      const rem = removerMock.find(r => r.id === remId)
                                      return <li key={remId} className="text-red-500">- {rem?.nome}</li>
                                    })}
                                  </ul>
                                ) : (<p className="text-sm text-gray-400">Padrão</p>)}
                            </div>
                            <p className="font-bold text-gray-900 text-lg">{formatarMoeda(item.precoTotalUnitario * item.quantidade)}</p>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                          <button onClick={() => removerDoCarrinho(item.idItem)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                          <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                            <button onClick={() => atualizarQuantidade(item.idItem, -1)} className={`p-2 text-gray-600 hover:bg-gray-200 rounded-l-lg ${item.quantidade === 1 ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={item.quantidade === 1}><Minus size={16} /></button>
                            <span className="w-10 text-center font-bold text-gray-800">{item.quantidade}</span>
                            <button onClick={() => atualizarQuantidade(item.idItem, 1)} className="p-2 text-gray-600 hover:bg-gray-200 rounded-r-lg"><Plus size={16} /></button>
                          </div>
                        </div>
                    </div>
                ))
            )}
        </div>

        {/* --- RODAPÉ COM BOTÃO DE ENVIAR --- */}
        <div className="p-6 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="space-y-2 mb-6 text-sm text-gray-600 font-medium">
                <div className="flex justify-between"><span>Subtotal:</span><span>{formatarMoeda(subtotal)}</span></div>
                <div className="flex justify-between text-gray-500"><span>Taxa de Serviço (10%):</span><span>{formatarMoeda(taxaServico)}</span></div>
            </div>
            <div className="flex justify-between text-2xl font-bold text-gray-900 mb-6 pt-4 border-t border-dashed border-gray-200">
              <span>Total:</span><span>{formatarMoeda(total)}</span>
            </div>
            
            <button 
                onClick={handleEnviarPedido}
                disabled={carrinho.length === 0 || loading}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 
                    ${carrinho.length === 0 || loading
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-[#FF9933] hover:bg-[#E88D2E] text-white shadow-lg shadow-orange-200 hover:shadow-xl hover:-translate-y-1'
                    }`}
            >
                {loading ? (
                    <>
                        <Loader2 className="animate-spin" size={24} /> Enviando...
                    </>
                ) : (
                    "Enviar Pedido"
                )}
            </button>
        </div>
      </div>
    </div>
  )
}