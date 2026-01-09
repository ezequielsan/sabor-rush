'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Search, ChevronLeft, Tag } from 'lucide-react'

// Mock de produtos (depois virá do banco)
const produtosMock = [
  { id: 1, nome: 'X-Burguer', categoria: 'Lanches', preco: 18.90, img: null },
  { id: 2, nome: 'X-Bacon', categoria: 'Lanches', preco: 22.90, img: null },
  { id: 3, nome: 'X-Tudo', categoria: 'Lanches', preco: 28.90, img: null },
  { id: 4, nome: 'X-Salada', categoria: 'Lanches', preco: 16.90, img: null },
  { id: 5, nome: 'Pizza Margherita', categoria: 'Pizzas', preco: 42.00, img: null },
  { id: 6, nome: 'Pizza Calabresa', categoria: 'Pizzas', preco: 45.00, img: null },
]

const categorias = ['Todos', 'Lanches', 'Pizzas', 'Bebidas', 'Sobremesas', 'Pratos', 'Porções']

export default function PedidoPage() {
  const router = useRouter()
  const params = useParams() // Pega o ID da mesa da URL
  
  const [busca, setBusca] = useState('')
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos')
  const [carrinho, setCarrinho] = useState<any[]>([])

  // Filtra produtos
  const produtosFiltrados = produtosMock.filter(p => {
    const matchNome = p.nome.toLowerCase().includes(busca.toLowerCase())
    const matchCategoria = categoriaAtiva === 'Todos' || p.categoria === categoriaAtiva
    return matchNome && matchCategoria
  })

  // Adicionar ao carrinho
  function adicionarAoCarrinho(produto: any) {
    setCarrinho(prev => [...prev, { ...produto, idItem: Math.random() }])
  }

  // Cálculos do Resumo
  const subtotal = carrinho.reduce((acc, item) => acc + item.preco, 0)
  const taxaServico = subtotal * 0.10
  const total = subtotal + taxaServico

  return (
    <div className="flex h-[calc(100vh-80px)] -m-10"> {/* -m-10 compensa o padding do layout */}
      
      {/* --- LADO ESQUERDO: CATÁLOGO (70% da tela) --- */}
      <div className="flex-1 flex flex-col bg-[#F3F4F6] border-r border-gray-200">
        
        {/* Topo do Catálogo */}
        <div className="bg-white p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-medium flex items-center gap-2 transition-colors"
                >
                   <ChevronLeft size={18} /> Voltar
                </button>
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Novo Pedido</h1>
                    <p className="text-sm text-gray-500">Mesa {params.id}</p>
                </div>
            </div>
            <div className="text-right">
                <span className="font-medium text-gray-700">Fulano de Tal</span>
            </div>
        </div>

        {/* Barra de Busca e Filtros */}
        <div className="p-6 pb-2">
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Buscar Produtos..." 
                    className="w-full pl-12 pr-4 py-3 bg-gray-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-700 placeholder:text-gray-500"
                    value={busca}
                    onChange={e => setBusca(e.target.value)}
                />
            </div>
            
            {/* Categorias (Pílulas) */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categorias.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setCategoriaAtiva(cat)}
                        className={`px-6 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                            categoriaAtiva === cat 
                            ? 'bg-white shadow-sm text-gray-900 ring-1 ring-gray-200' 
                            : 'bg-transparent text-gray-500 hover:bg-gray-200/50'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>

        {/* Grid de Produtos */}
        <div className="flex-1 overflow-y-auto p-6 pt-2">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {produtosFiltrados.map(produto => (
                    <div 
                        key={produto.id}
                        onClick={() => adicionarAoCarrinho(produto)}
                        className="bg-white p-4 rounded-xl border border-gray-100 hover:shadow-md cursor-pointer transition-all flex flex-col h-64 group"
                    >
                        {/* Placeholder de Imagem */}
                        <div className="w-full h-32 bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-gray-300 group-hover:bg-orange-50 transition-colors">
                           <Tag size={32} />
                        </div>
                        
                        <h3 className="font-bold text-lg text-gray-800 mb-1">{produto.nome}</h3>
                        <p className="text-sm text-gray-400 mb-2">{produto.categoria}</p>
                        <div className="mt-auto flex items-end justify-between">
                            <span className="text-lg font-bold text-gray-900">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.preco)}
                            </span>
                            <span className="text-xs text-gray-400">Personalizável</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* --- LADO DIREITO: RESUMO DO PEDIDO (30% da tela) --- */}
      <div className="w-[400px] bg-white flex flex-col h-full border-l border-gray-200 shadow-xl z-10">
        <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">Resumo do Pedido</h2>
            <p className="text-gray-500 text-sm">{carrinho.length} Itens</p>
        </div>

        {/* Lista de Itens do Carrinho */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {carrinho.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <p className="text-lg">Carrinho vazio</p>
                </div>
            ) : (
                carrinho.map((item) => (
                    <div key={item.idItem} className="flex justify-between items-start py-2 border-b border-gray-50 last:border-0">
                        <div>
                            <p className="font-bold text-gray-800">{item.nome}</p>
                            <p className="text-sm text-gray-400">Padrão</p>
                        </div>
                        <p className="font-medium text-gray-900">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.preco)}
                        </p>
                    </div>
                ))
            )}
        </div>

        {/* Totais e Ações */}
        <div className="p-6 bg-gray-50 border-t border-gray-100">
            {/* Cupom */}
            <div className="flex gap-2 mb-6">
                <input 
                    type="text" 
                    placeholder="Código do Cupom"
                    className="flex-1 bg-gray-200/50 rounded-lg px-3 py-2 text-sm focus:outline-none"
                />
                <button className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500">
                   <Tag size={18} />
                </button>
            </div>

            <div className="space-y-2 mb-6 text-sm text-gray-600">
                <div className="flex justify-between">
                    <span>Desconto (%)</span>
                    <div className="w-16 bg-gray-200/50 rounded px-2 py-1 text-right">0</div>
                </div>
                <div className="flex justify-between">
                    <span>Taxa de Serviço (%)</span>
                    <div className="w-16 bg-gray-200/50 rounded px-2 py-1 text-right">10</div>
                </div>
            </div>

            <div className="space-y-2 mb-6">
                <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}</span>
                </div>
                 <div className="flex justify-between text-gray-600">
                    <span>Taxa de Serviço:</span>
                    <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(taxaServico)}</span>
                </div>
                 <div className="flex justify-between text-xl font-bold text-gray-900 mt-4">
                    <span>Total:</span>
                    <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
                </div>
            </div>

            <button className="w-full bg-[#FF9933] hover:bg-[#E88D2E] text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-200 transition-all">
                Enviar para Produção
            </button>
        </div>
      </div>

    </div>
  )
}