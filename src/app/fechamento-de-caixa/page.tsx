'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

type PagamentoLinhaProps = {
  titulo: string
  valorEsperado?: number
}

export default function FechamentoCaixaPage() {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-gray-100">

            {/* HEADER */}
            <header className="bg-white border-b px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="px-3 py-1 border rounded text-sm text-gray-700 hover:bg-gray-50"
                        >
                            Voltar
                        </button>

                        <div>
                            <h1 className="text-lg text-gray-500 font-semibold">Fechamento de caixa</h1>
                            <p className="text-sm text-gray-500">
                                terça-feira, 19 de novembro de 2025
                            </p>
                        </div>
                    </div>

                    <div className="text-right">
                        <p className="text-sm text-gray-500 font-medium">Admin</p>
                        <p className="text-xs text-gray-500">22:18:55</p>
                    </div>
                </div>
            </header>

            {/* CARDS */}
            <section className="px-6 py-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-700">Valor Esperado</p>
                        <p className="text-xl font-semibold text-blue-900">R$ 1359,60</p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-700">Valor Informado</p>
                        <p className="text-xl font-semibold text-green-900">R$ 0,00</p>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-700">Divergências</p>
                        <p className="text-xl font-semibold text-red-900">R$ 1359,60</p>
                        <p className="text-xs text-red-600">Falta</p>
                    </div>
                </div>
            </section>

            {/* CONFERÊNCIA POR FORMA DE PAGAMENTO */}
            <section className="px-6 pb-10">
                <div className="bg-white rounded-xl shadow-sm p-6">

                    <h2 className="text-lg text-gray-500 font-semibold mb-1">
                        Conferência por Forma de Pagamento
                    </h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Informe os valores recebidos em cada forma de pagamento
                    </p>

                    {/* LINHAS */}
                    <div className="text-gray-500">
                        <PagamentoLinha titulo="Dinheiro" valorEsperado={350.5} />
                        <PagamentoLinha titulo="Cartão de Crédito" valorEsperado={520.3} />
                        <PagamentoLinha titulo="Cartão de Débito" valorEsperado={289.8} />
                        <PagamentoLinha titulo="PIX" valorEsperado={199} />
                    </div>


                    {/* OBSERVAÇÕES */}
                    <div className="mt-6">
                        <label className="block text-sm text-gray-500 font-medium mb-2">
                            Observações
                        </label>
                        <textarea
                            placeholder="Adicione uma observação..."
                            className="w-full border rounded-lg p-3 text-gray-500 text-sm resize-none h-24"
                        />
                    </div>

                    {/* ALERTA */}
                    <div className="mt-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                        Há uma divergência de <strong>R$ 1359,60</strong> no caixa.<br />
                        O valor informado é menor que o esperado (falta no caixa).
                    </div>

                    {/* BOTÕES */}
                    <div className="flex flex-wrap gap-3 justify-end mt-6">
                        <button className="px-4 py-2 border text-gray-500 rounded-lg text-sm">
                            Imprimir Relatório
                        </button>
                        <button className="px-4 py-2 border text-gray-500 rounded-lg text-sm">
                            Salvar Rascunho
                        </button>
                        <button className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600">
                            Confirmar Fechamento
                        </button>
                    </div>

                </div>
            </section>

            {/* RESUMO DO TURNO / MOVIMENTAÇÃO */}
            <section className="px-6 pb-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* RESUMO DO TURNO */}
                    <div className="bg-white rounded-xl border p-6">
                        <h3 className="text-sm text-gray-500 font-semibold mb-4">
                            Resumo do Turno
                        </h3>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Vendas Realizadas:</span>
                                <span className="font-medium text-gray-500">47</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">Ticket Médio:</span>
                                <span className="font-medium text-gray-500">R$ 28,80</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">Mesas Atendidas:</span>
                                <span className="font-medium text-gray-500">23</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">Horário de Abertura:</span>
                                <span className="font-medium text-gray-500">18:00</span>
                            </div>
                        </div>
                    </div>

                    {/* MOVIMENTAÇÃO DO DIA */}
                    <div className="bg-white rounded-xl border p-6">
                        <h3 className="text-sm text-gray-500 font-semibold mb-4">
                            Movimentação do Dia
                        </h3>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Vendas Brutas:</span>
                                <span className="font-medium text-gray-500">R$ 1359,60</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">Descontos Aplicados:</span>
                                <span className="font-medium text-red-600">-R$ 42,30</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">Cancelamentos:</span>
                                <span className="font-medium text-red-600">-R$ 15,90</span>
                            </div>

                            <hr className="my-2" />

                            <div className="flex justify-between">
                                <span className="font-semibold text-gray-500">Total Líquido:</span>
                                <span className="font-semibold text-gray-500">R$ 1301,40</span>
                            </div>
                        </div>
                    </div>

                </div>
            </section>


        </div>
    )
}

/* COMPONENTE DE LINHA */
function PagamentoLinha({ titulo, valorEsperado = 0 }: PagamentoLinhaProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4 border-b">
      <p className="text-sm font-medium">{titulo}</p>

      <input
        disabled
        value={`R$ ${valorEsperado.toFixed(2)}`}
        className="border rounded-lg px-3 py-2 text-sm bg-gray-100"
      />

      <input
        placeholder="Valor recebido"
        className="border rounded-lg px-3 py-2 text-sm"
      />
    </div>
  )
}
