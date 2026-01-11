'use client'

import { Search, X } from 'lucide-react'
import { useState } from 'react'

type Produto = {
    nome: string
    categoria: string
    preco: string
}

type Adicional = {
    id: number
    nome: string
    preco: number
    checked: boolean
}

export default function CardapioPage() {
    const [modalAberto, setModalAberto] = useState(false)
    const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null)

    const [adicionais, setAdicionais] = useState<Adicional[]>([
        { id: 1, nome: 'Bacon Extra', preco: 4.0, checked: false },
        { id: 2, nome: 'Queijo Extra', preco: 3.0, checked: false },
        { id: 3, nome: 'Ovo', preco: 2.5, checked: false },
        { id: 4, nome: 'Catupiry', preco: 3.5, checked: false },
        { id: 5, nome: 'Cheddar', preco: 3.5, checked: false }
    ])

    function abrirModal(produto: Produto) {
        setProdutoSelecionado(produto)
        setModalAberto(true)
    }

    function fecharModal() {
        setModalAberto(false)
        setProdutoSelecionado(null)
        setAdicionais((prev) =>
            prev.map((item) => ({ ...item, checked: false }))
        )
    }

    function toggleAdicional(id: number) {
        setAdicionais((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, checked: !item.checked } : item
            )
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">

            {/* HEADER */}
            <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button className="border text-gray-500 px-3 py-1 rounded text-sm hover:bg-gray-300">
                        Voltar
                    </button>

                    <div>
                        <p className="text-sm text-gray-500">Novo Pedido</p>
                        <p className="text-sm font-semibold text-gray-900">Mesa 1</p>
                    </div>
                </div>

                <p className="text-sm font-medium text-gray-700">Ciclano</p>
            </header>

            {/* CONTEÚDO */}
            <main className="flex flex-1 overflow-hidden">

                {/* PRODUTOS */}
                <section className="flex-1 p-6 overflow-y-auto">

                    {/* BUSCA */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar Produtos..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-200 focus:outline-none"
                        />
                    </div>

                    {/* FILTROS */}
                    <div className="flex gap-2 mb-6 flex-wrap">
                        {['Todos', 'Lanches', 'Pizzas', 'Bebidas', 'Sobremesas', 'Pratos', 'Porções'].map((cat) => (
                            <button
                                key={cat}
                                className={`px-4 py-1 rounded-full text-sm ${cat === 'Todos'
                                        ? 'bg-white border font-medium text-gray-700'
                                        : 'bg-gray-200 text-gray-600'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ProdutoCard nome="X-Burger" categoria="Lanches" preco="R$ 18,90" onClick={abrirModal} />
                        <ProdutoCard nome="X-Bacon" categoria="Lanches" preco="R$ 22,90" onClick={abrirModal} />
                        <ProdutoCard nome="X-Tudo" categoria="Lanches" preco="R$ 28,90" onClick={abrirModal} />
                        <ProdutoCard nome="X-Salada" categoria="Lanches" preco="R$ 16,90" onClick={abrirModal} />
                        <ProdutoCard nome="Pizza Margherita" categoria="Pizzas" preco="R$ 42,00" onClick={abrirModal} />
                        <ProdutoCard nome="Pizza Calabresa" categoria="Pizzas" preco="R$ 45,00" onClick={abrirModal} />
                    </div>
                </section>

                {/* RESUMO */}
                <aside className="w-full max-w-sm bg-white border-l p-6 flex flex-col">
                    <h2 className="text-lg text-gray-500 font-semibold mb-1">Resumo do Pedido</h2>
                    <p className="text-sm text-gray-500 mb-4">0 Itens</p>

                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        Carrinho vazio
                    </div>
                    {/* TOTAIS */}
                    <div className="mt-6 space-y-2 text-sm">
                        <div className="flex justify-between text-gray-500">
                            <span>Subtotal:</span>
                            <span>R$ 0,00</span>
                        </div>

                        <div className="flex justify-between text-gray-500">
                            <span>Taxa de Serviço:</span>
                            <span>R$ 0,00</span>
                        </div>

                        <div className="flex justify-between font-semibold text-base text-gray-500">
                            <span>Total:</span>
                            <span>R$ 0,00</span>
                        </div>
                    </div>
                    <button className="mt-6 bg-orange-400 hover:bg-orange-500 text-white py-3 rounded-lg font-semibold">
                        Enviar para Produção
                    </button>
                </aside>
            </main>

            {/* MODAL */}
            {modalAberto && produtoSelecionado && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-md rounded-xl p-6 relative">

                        <button
                            onClick={fecharModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X />
                        </button>

                        <h2 className="text-lg font-semibold text-gray-900">
                            {produtoSelecionado.nome}
                        </h2>
                        <p className="text-sm text-gray-500 mb-4">
                            Personalize seu pedido
                        </p>

                        {/* ADICIONAIS */}
                        <h3 className="font-medium text-gray-500 mb-2">Adicionais</h3>
                        <div className="space-y-3 text-sm">
                            {adicionais.map((item) => (
                                <label
                                    key={item.id}
                                    className="flex items-center text-gray-500 justify-between cursor-pointer"
                                >
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={item.checked}
                                            onChange={() => toggleAdicional(item.id)}
                                            className="w-4 h-4"
                                        />
                                        <span>{item.nome}</span>
                                    </div>

                                    {item.checked && (
                                        <span className="text-gray-700">
                                            +R$ {item.preco.toFixed(2)}
                                        </span>
                                    )}
                                </label>
                            ))}
                        </div>

                        {/* REMOVER */}
                        <h3 className="font-medium text-gray-500 mt-4 mb-2">Remover</h3>
                        <div className="space-y-2 text-gray-500 text-sm">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" /> Sem Cebola
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" /> Sem Tomate
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" /> Sem Alface
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" /> Sem Maionese
                            </label>
                        </div>

                        {/* AÇÕES */}
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={fecharModal}
                                className="border text-gray-500 px-4 py-2 rounded"
                            >
                                Cancelar
                            </button>
                            <button className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded">
                                Adicionar ao Pedido
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

/* ===== PRODUTO CARD ===== */

function ProdutoCard({
    nome,
    categoria,
    preco,
    onClick
}: {
    nome: string
    categoria: string
    preco: string
    onClick: (produto: Produto) => void
}) {
    return (
        <div
            onClick={() => onClick({ nome, categoria, preco })}
            className="bg-white border rounded-lg p-4 hover:shadow cursor-pointer"
        >
            <div className="bg-gray-200 h-40 rounded mb-3" />

            <p className="font-semibold text-gray-900">{nome}</p>
            <p className="text-sm text-gray-500">{categoria}</p>
            <p className="mt-2 font-medium text-gray-900">{preco}</p>
            <p className="text-xs text-gray-400">Personalizável</p>
        </div>
    )
}
