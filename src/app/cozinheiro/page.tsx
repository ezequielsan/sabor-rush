'use client'

import { User } from 'lucide-react'

export default function CozinheiroPage() {
  return (
    <div className="min-h-screen bg-gray-50">

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
              Cozinha
            </p>
            <p className="text-xs text-gray-900">
              Cozinheiro
            </p>
          </div>

          <button className="border border-gray-300 px-4 py-2 rounded-md text-sm text-gray-900 hover:bg-gray-100 transition">
            Sair
          </button>
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="p-6 space-y-8">

        {/* ===== CAIXAS DE STATUS ===== */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <StatusCard title="Total de Pedidos" value="4" />

          <StatusCard
            title="Recebidos"
            value="1"
            bg="bg-blue-100"
            text="text-gray-900"
          />

          <StatusCard
            title="Em Preparo"
            value="1"
            bg="bg-yellow-100"
            text="text-gray-900"
          />

          <StatusCard
            title="Prontos"
            value="2"
            bg="bg-green-100"
            text="text-gray-900"
          />
        </section>

        {/* ===== COLUNAS ===== */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <Column title="Recebido" count={2} dot="bg-blue-500">
            <OrderCard
              color="blue"
              mesa="Mesa 2"
              pedido="#01"
              tempo="136 min"
              items={[
                '2x X-Burguer (+ Bacon Extra, - Cebola)',
                '1x Coca-Cola 350ml'
              ]}
              buttonText="Iniciar Preparo →"
            />
          </Column>

          <Column title="Em Preparo" count={1} dot="bg-yellow-500">
            <OrderCard
              color="yellow"
              mesa="Mesa 5"
              pedido="#02"
              tempo="142 min"
              items={[
                '2x Filé à Parmegiana',
                '2x Batata Frita'
              ]}
              buttonText="Marcar como Pronto →"
            />
          </Column>

          <Column title="Pronto para Servir" count={2} dot="bg-green-500">
            <OrderCard
              color="green"
              mesa="Mesa 5"
              pedido="#02"
              tempo="149 min"
              items={[
                '1x Pizza Margherita',
                '2x Suco Natural'
              ]}
              buttonText="Confirmar Entrega"
            />

            <OrderCard
              color="green"
              mesa="Mesa 11"
              pedido="#04"
              tempo="163 min"
              items={[
                '1x X-Tudo (+ Queijo Extra)'
              ]}
              buttonText="Confirmar Entrega"
            />
          </Column>

        </section>
      </main>
    </div>
  )
}

/* ===== COMPONENTES ===== */

function StatusCard({
  title,
  value,
  bg = 'bg-white',
  text = 'text-gray-900'
}: {
  title: string
  value: string
  bg?: string
  text?: string
}) {
  return (
    <div className={`${bg} border border-gray-200 rounded-lg p-6 min-h-48`}>
      <p className="text-xl font-medium text-gray-900">
        {title}
      </p>
      <p className={`text-6xl font-bold mt-4 ${text}`}>
        {value}
      </p>
    </div>
  )
}

function Column({
  title,
  count,
  dot,
  children
}: {
  title: string
  count: number
  dot: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${dot}`} />
        <h2 className="font-semibold text-gray-900">{title}</h2>
        <span className="text-sm text-gray-900">{count}</span>
      </div>
      {children}
    </div>
  )
}

function OrderCard({
  mesa,
  pedido,
  tempo,
  items,
  buttonText,
  color
}: {
  mesa: string
  pedido: string
  tempo: string
  items: string[]
  buttonText: string
  color: 'blue' | 'yellow' | 'green'
}) {
  const styles = {
    blue: {
      bg: 'bg-blue-100 border-blue-300',
      button: 'bg-blue-600 hover:bg-blue-700'
    },
    yellow: {
      bg: 'bg-yellow-100 border-yellow-300',
      button: 'bg-yellow-500 hover:bg-yellow-600'
    },
    green: {
      bg: 'bg-green-100 border-green-300',
      button: 'bg-green-600 hover:bg-green-700'
    }
  }

  return (
    <div className={`border rounded-lg p-4 space-y-4 ${styles[color].bg}`}>
      <div className="flex justify-between text-sm text-gray-900">
        <div>
          <p>{mesa}</p>
          <p className="font-semibold">Pedido {pedido}</p>
        </div>
        <span className="text-red-600">{tempo}</span>
      </div>

      <ul className="text-sm space-y-1 text-gray-900">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      <button
        className={`w-full text-white py-2 rounded-md text-sm transition ${styles[color].button}`}
      >
        {buttonText}
      </button>
    </div>
  )
}
