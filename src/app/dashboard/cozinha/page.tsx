import { buscarPedidosCozinha } from '@/actions/pedidos'
import CozinhaBoard from '@/components/CozinhaBoard'
import Link from 'next/link'
import { ChefHat, ArrowLeft } from 'lucide-react'

export default async function CozinhaPage() {
  const resultado = await buscarPedidosCozinha()
  const pedidos = resultado.sucesso ? resultado.dados : []

  return (
    // h-full é crucial aqui para herdar o h-screen do layout
    <div className="flex h-full flex-col"> 
      
      <header className="mb-4 flex flex-shrink-0 items-center justify-between">
        <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <ChefHat size={24} />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Monitor de Cozinha</h1>
                <p className="text-sm text-gray-500">Gerencie o preparo</p>
            </div>
        </div>

        {/* <Link 
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
        >
            <ArrowLeft size={18} /> Ver Mesas
        </Link> */}
      </header>

      {/* Container do Board ocupando o resto da tela */}
      <div className="min-h-0 flex-1">
         <CozinhaBoard pedidosIniciais={pedidos || []} />
      </div>

    </div>
  )
}