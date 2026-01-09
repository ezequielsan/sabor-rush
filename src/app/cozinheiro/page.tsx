'use client'

import { User } from 'lucide-react'

export default function CozinheiroPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* HEADER */}
      <header className="w-full bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        
        {/* Lado esquerdo */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <User className="text-purple-700" size={24} />
          </div>

          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Sabor Rush
            </h1>
            <p className="text-sm text-gray-500">
              Gerenciamento de mesas
            </p>
          </div>
        </div>

        {/* Lado direito */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">
              Cozinha
            </p>
            <p className="text-xs text-gray-500">
              Cozinheiro
            </p>
          </div>

          <button
            className="border border-gray-300 px-4 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition"
          >
            Sair
          </button>
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="p-6 space-y-6">
        
        {/* Cards de status */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total de Pedidos */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 min-h-48 flex flex-col justify-start">
            <p className="text-lg text-gray-500 font-medium">
              Total de Pedidos
            </p>
            <p className="text-5xl font-bold text-gray-900 mt-4">
              4
            </p>
          </div>

          {/* Recebidos */}
          <div className="bg-blue-100 border border-blue-200 rounded-lg p-6 min-h-48 flex flex-col justify-start">
            <p className="text-lg text-blue-700 font-medium">
              Recebidos
            </p>
            <p className="text-5xl font-bold text-blue-900 mt-4">
              1
            </p>
          </div>

          {/* Em Preparo */}
          <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-6 min-h-48 flex flex-col justify-start">
            <p className="text-lg text-yellow-700 font-medium">
              Em Preparo
            </p>
            <p className="text-5xl font-bold text-yellow-900 mt-4">
              1
            </p>
          </div>

          {/* Prontos */}
          <div className="bg-green-100 border border-green-200 rounded-lg p-6 min-h-48 flex flex-col justify-start">
            <p className="text-lg text-green-700 font-medium">
              Prontos
            </p>
            <p className="text-5xl font-bold text-green-900 mt-4">
              2
            </p>
          </div>

        </section>

      </main>
    </div>
  )
}
