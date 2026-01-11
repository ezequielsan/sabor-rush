'use client'

import { useState } from 'react'
import { 
  Search, Plus, Edit3, Trash2, X, CheckCircle, XCircle, Loader2, Package, AlertTriangle
} from 'lucide-react'
import { useRouter } from 'next/navigation'
// Importamos as funções do seu arquivo atualizado
import { salvarProduto, atualizarProdutoCompleto, excluirProduto, alternarStatusProduto } from '@/actions/produtos'

// Formatação de Moeda
const formatarMoeda = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

interface Produto {
  id: string
  nome: string
  descricao?: string | null
  preco: number
  categoria: string
  quantidadeEstoque: number
  ativo: boolean
}

interface ProdutosListProps {
  produtosIniciais: Produto[]
}

export default function ProdutosList({ produtosIniciais }: ProdutosListProps) {
  const router = useRouter()
  // Usa dados iniciais, o revalidatePath no server action atualiza a tela
  const produtos = produtosIniciais
  
  const [busca, setBusca] = useState('')
  const [loading, setLoading] = useState(false)
  const [modalAberto, setModalAberto] = useState(false)
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null)
  
  // Estado do Formulário
  const [formData, setFormData] = useState({ 
    nome: '', 
    descricao: '', 
    preco: '', 
    categoria: 'LANCHES', 
    estoque: '0' 
  })

  // Filtro de Busca
  const filtrados = produtos.filter(p => 
    p.nome.toLowerCase().includes(busca.toLowerCase()) || 
    p.categoria.toLowerCase().includes(busca.toLowerCase())
  )

  // KPIs (Dados do topo)
  const kpis = {
    total: produtos.length,
    ativos: produtos.filter(p => p.ativo).length,
    baixoEstoque: produtos.filter(p => p.quantidadeEstoque < 10).length,
    lanches: produtos.filter(p => p.categoria === 'LANCHES').length,
    bebidas: produtos.filter(p => p.categoria === 'BEBIDAS').length,
    sobremesas: produtos.filter(p => p.categoria === 'SOBREMESAS').length,
  }

  // --- AÇÕES ---

  const handleAbrirModal = (produto?: Produto) => {
    if (produto) {
      setProdutoEditando(produto)
      setFormData({ 
        nome: produto.nome, 
        descricao: produto.descricao || '', 
        preco: String(produto.preco), 
        categoria: produto.categoria, 
        estoque: String(produto.quantidadeEstoque) 
      })
    } else {
      setProdutoEditando(null)
      setFormData({ nome: '', descricao: '', preco: '', categoria: 'LANCHES', estoque: '0' })
    }
    setModalAberto(true)
  }

  const handleSalvar = async () => {
    if (!formData.nome || !formData.preco) return alert("Preencha nome e preço")

    setLoading(true)
    let res
    
    if (produtoEditando) {
      // Editar existente
      res = await atualizarProdutoCompleto(produtoEditando.id, formData)
    } else {
      // Criar Novo (Adaptando para sua função salvarProduto)
      res = await salvarProduto({
        nome: formData.nome,
        preco: parseFloat(formData.preco),
        categoria: formData.categoria,
        estoque: parseInt(formData.estoque),
        descricao: formData.descricao
      })
    }

    if (res.sucesso) {
      setModalAberto(false)
      // Não precisa forçar reload manual se usar revalidatePath no server
    } else {
      alert(res.erro)
    }
    setLoading(false)
  }

  const handleExcluir = async (id: string) => {
    if(!confirm("Tem certeza que deseja excluir definitivamente? Para apenas esconder, use o botão de Status.")) return
    await excluirProduto(id)
  }

  const handleStatus = async (id: string, statusAtual: boolean) => {
    // Inverte o status atual
    await alternarStatusProduto(id, !statusAtual)
  }

  // Badges de Categoria
  const getCategoriaBadge = (cat: string) => {
    switch(cat) {
      case 'LANCHES': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'BEBIDAS': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'SOBREMESAS': return 'bg-pink-100 text-pink-700 border-pink-200'
      case 'ACOMPANHAMENTOS': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="flex flex-col h-full">
      
      {/* HEADER */}
      <div className="flex justify-between items-start mb-6">
        <div>
           <button onClick={() => router.back()} className="px-4 py-2 bg-gray-200 rounded text-gray-700 font-medium mb-2 hover:bg-gray-300 transition text-sm">
             Voltar
           </button>
           <h1 className="text-2xl font-bold text-gray-800">Catálogo de Produtos</h1>
           <p className="text-gray-500 text-sm">Gerencie o cardápio e estoque</p>
        </div>
      </div>

      {/* CARDS KPI (Horizontal Scroll) */}
      <div className="flex gap-4 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        <KpiCard label="Total Produtos " valor={kpis.total} cor="gray" />
        <KpiCard label="Baixo Estoque " valor={kpis.baixoEstoque} cor="red" />
        <KpiCard label="Lanches" valor={kpis.lanches} cor="orange" />
        <KpiCard label="Bebidas" valor={kpis.bebidas} cor="blue" />
        <KpiCard label="Sobremesas" valor={kpis.sobremesas} cor="purple" />
      </div>

      {/* BARRA DE AÇÃO */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-gray-50 p-2 rounded-lg gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar produto..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none text-gray-900 placeholder-gray-500"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <button 
          onClick={() => handleAbrirModal()}
          className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition shadow-sm"
        >
          <Plus size={20} /> Novo Produto
        </button>
      </div>

      {/* TABELA */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto shadow-sm flex-1">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="bg-gray-50 text-gray-500 font-bold text-sm uppercase tracking-wider">
             <tr>
               <th className="p-4 border-b">Nome</th>
               <th className="p-4 border-b">Categoria</th>
               <th className="p-4 border-b">Preço</th>
               <th className="p-4 border-b">Estoque</th>
               <th className="p-4 border-b">Status</th>
               <th className="p-4 border-b text-right">Ações</th>
             </tr>
          </thead>
          <tbody className="text-gray-700 text-sm">
            {filtrados.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 border-b last:border-0 transition">
                <td className="p-4 font-medium text-gray-900">
                  <div className="flex flex-col">
                    <span className="text-base">{p.nome}</span>
                    <span className="text-xs text-gray-400 font-normal truncate max-w-[200px]">{p.descricao || 'Sem descrição'}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getCategoriaBadge(p.categoria)}`}>
                    {p.categoria}
                  </span>
                </td>
                <td className="p-4 font-bold text-gray-900">{formatarMoeda(p.preco)}</td>
                <td className="p-4">
                  {p.quantidadeEstoque < 10 ? (
                    <span className="text-red-600 font-bold flex items-center gap-1">
                      {p.quantidadeEstoque} un <AlertTriangle size={14}/>
                    </span>
                  ) : (
                    <span className="text-gray-600 font-medium">{p.quantidadeEstoque} un</span>
                  )}
                </td>
                <td className="p-4">
                  {/* Botão interativo de Status */}
                  <button 
                    onClick={() => handleStatus(p.id, p.ativo)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border w-fit cursor-pointer transition
                    ${p.ativo 
                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200' 
                        : 'bg-red-50 text-red-700 border-red-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200'}
                    `}
                    title="Clique para alternar status"
                  >
                    {p.ativo ? <CheckCircle size={12}/> : <XCircle size={12}/>}
                    {p.ativo ? 'Ativo' : 'Inativo'}
                  </button>
                </td>
                <td className="p-4 text-right space-x-2">
                   <button onClick={() => handleAbrirModal(p)} className="text-blue-400 hover:text-blue-600 p-1"><Edit3 size={18}/></button>
                   <button onClick={() => handleExcluir(p.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">Nenhum produto encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL --- */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="p-6 border-b flex justify-between items-center">
               <div>
                 <h2 className="text-2xl font-bold text-gray-900">
                   {produtoEditando ? 'Editar Produto' : 'Novo Produto'}
                 </h2>
                 <p className="text-gray-500 text-sm">
                   Preencha os dados do item
                 </p>
               </div>
               <button onClick={() => setModalAberto(false)} className="text-gray-400 hover:text-gray-600">
                 <X size={24} />
               </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nome do Produto *</label>
                <input 
                  type="text" 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-gray-900 placeholder-gray-400"
                  value={formData.nome}
                  onChange={e => setFormData({...formData, nome: e.target.value})}
                  placeholder="Ex: X-Burguer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Preço (R$) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-gray-900 placeholder-gray-400"
                    value={formData.preco}
                    onChange={e => setFormData({...formData, preco: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Estoque Atual *</label>
                  <input 
                    type="number" 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-gray-900 placeholder-gray-400"
                    value={formData.estoque}
                    onChange={e => setFormData({...formData, estoque: e.target.value})}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Categoria *</label>
                <div className="relative">
                  <select 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none appearance-none text-gray-900"
                    value={formData.categoria}
                    onChange={e => setFormData({...formData, categoria: e.target.value})}
                  >
                    <option value="LANCHES">Lanches</option>
                    <option value="BEBIDAS">Bebidas</option>
                    <option value="SOBREMESAS">Sobremesas</option>
                    <option value="ACOMPANHAMENTOS">Acompanhamentos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Descrição</label>
                <textarea 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-gray-900 placeholder-gray-400 resize-none h-24"
                  value={formData.descricao}
                  onChange={e => setFormData({...formData, descricao: e.target.value})}
                  placeholder="Ex: Pão brioche, carne 180g, queijo cheddar..."
                />
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setModalAberto(false)} className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-100">
                Cancelar
              </button>
              <button 
                onClick={handleSalvar}
                disabled={loading}
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold shadow-lg shadow-orange-200 transition flex items-center gap-2"
              >
                {loading && <Loader2 className="animate-spin" size={18} />}
                {produtoEditando ? 'Salvar Produto' : 'Criar Produto'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

// Subcomponente de Card
function KpiCard({ label, valor, cor, icon: Icon }: any) {
  const cores: any = {
    gray: 'border-gray-300 bg-white text-gray-900',
    green: 'border-green-200 bg-green-50 text-green-700',
    red: 'border-red-200 bg-red-50 text-red-700',
    purple: 'border-purple-200 bg-purple-50 text-purple-700',
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    orange: 'border-orange-200 bg-orange-50 text-orange-700',
  }
  const textoCor = cor === 'gray' ? 'text-gray-900' : `text-${cor}-600`
  return (
    <div className={`min-w-[150px] h-28 p-5 rounded-xl border flex flex-col justify-between transition hover:shadow-sm ${cores[cor]}`}>
       <div className="flex justify-between items-start">
         <span className={`text-base font-medium ${textoCor}`}>{label}</span>
         {Icon && <Icon size={20} className={`opacity-60 ${textoCor}`} />}
       </div>
       <span className={`text-4xl font-normal ${textoCor}`}>{valor}</span>
    </div>
  )
}