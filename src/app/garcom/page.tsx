'use client'

import { User } from 'lucide-react'

export default function CaixaPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* HEADER */}
      <header className="w-full bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <User className="text-purple-700" size={24} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Sabor Rush
            </h1>
            <p className="text-sm text-gray-900">
              Gerenciamento de mesas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">
              Usuário 03
            </p>
            <p className="text-xs text-gray-900">
              Garçom
            </p>
          </div>

          <button className="border border-gray-300 px-4 py-2 rounded-md text-sm text-gray-900 hover:bg-gray-100 transition">
            Sair
          </button>
        </div>
      </header>

      {/* CONTEÚDO COM SCROLL */}
      <main className="flex-1 overflow-y-auto p-6 space-y-8">

        {/* CARDS DE STATUS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatusCard title="Total de Mesas" value="12" />
          <StatusCard title="Mesas Ocupadas" value="5" />
          <StatusCard title="Mesas Livres" value="7" />
          <StatusCard title="Faturamento Aberto" value="R$ 354,00" />
        </section>

        {/* COLUNAS DE MESAS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <MesaColumn>
            <MesaCard status="livre" mesa="Mesa 1" />
            <MesaCard status="livre" mesa="Mesa 4" />
            <MesaCard
              status="fechamento"
              mesa="Mesa 7"
              tempo="1h 30min"
              valor="R$ 89,00"
              pedidos="3 Pedidos"
            />
            <MesaCard status="livre" mesa="Mesa 10" />
          </MesaColumn>

          <MesaColumn>
            <MesaCard status="livre" mesa="Mesa 2" />
            <MesaCard
              status="ocupada"
              mesa="Mesa 5"
              tempo="1h 30min"
              valor="R$ 128,00"
              pedidos="5 Pedidos"
            />
            <MesaCard status="livre" mesa="Mesa 8" />
            <MesaCard status="ocupada" mesa="Mesa 11" />
          </MesaColumn>

          <MesaColumn>
            <MesaCard
              status="aguardando"
              mesa="Mesa 3"
              tempo="10min"
              valor="R$ 0,00"
              pedidos="0 Pedidos"
            />
            <MesaCard status="livre" mesa="Mesa 6" />
            <MesaCard
              status="ocupada"
              mesa="Mesa 9"
              tempo="45min"
              valor="R$ 67,50"
              pedidos="4 Pedidos"
            />
            <MesaCard status="livre" mesa="Mesa 12" />
          </MesaColumn>

        </section>
      </main>
    </div>
  )
}

/* ===== COMPONENTES ===== */

function StatusCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 min-h-48 flex flex-col justify-center">
      <p className="text-gray-900">{title}</p>
      <p className="text-3xl font-semibold text-gray-900 mt-2">{value}</p>
    </div>
  )
}

function MesaColumn({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 px-8">
      {children}
    </div>
  )
}

function MesaCard({
  mesa,
  status,
  tempo,
  valor,
  pedidos
}: {
  mesa: string
  status: 'livre' | 'ocupada' | 'aguardando' | 'fechamento'
  tempo?: string
  valor?: string
  pedidos?: string
}) {
  const styles = {
    livre: 'bg-green-100 border-green-300',
    ocupada: 'bg-red-100 border-red-300',
    aguardando: 'bg-orange-100 border-orange-300',
    fechamento: 'bg-blue-100 border-blue-300'
  }

  const statusLabel = {
    livre: 'Livre',
    ocupada: 'Ocupada',
    aguardando: 'Aguardando pedido',
    fechamento: 'Solicitando Fechamento'
  }

  return (
    <div
      className={`border rounded-lg p-4 h-48 flex flex-col justify-between text-center text-black ${styles[status]}`}
    >
      <div className="space-y-1">
        <p className="text-sm font-medium">
          {statusLabel[status]}
        </p>
        <p className="text-lg font-semibold">
          {mesa}
        </p>
      </div>

      {(tempo || valor || pedidos) && (
        <div className="text-sm space-y-1">
          {tempo && <p>{tempo}</p>}
          {valor && <p>{valor}</p>}
          {pedidos && <p>{pedidos}</p>}
        </div>
      )}
    </div>
  )
}

