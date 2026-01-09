import { DollarSign } from 'lucide-react'

export default function CaixaPage() {
  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-700">
          <DollarSign size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Frente de Caixa</h1>
          <p className="text-gray-500">Gestão de pagamentos e fechamento</p>
        </div>
      </header>

      <div className="flex-1 bg-white border border-gray-200 rounded-xl p-8 flex items-center justify-center flex-col text-center">
        <div className="bg-gray-50 p-6 rounded-full mb-4">
           <DollarSign size={48} className="text-gray-300" />
        </div>
        <h2 className="text-xl font-medium text-gray-900 mb-2">Módulo Financeiro</h2>
        <p className="text-gray-500 max-w-md">
          Esta tela será desenvolvida em breve. Aqui o operador de caixa poderá visualizar pedidos finalizados e realizar o fechamento do dia.
        </p>
      </div>
    </div>
  )
}