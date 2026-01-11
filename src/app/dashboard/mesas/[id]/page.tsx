import { prisma } from '@/lib/prisma'
import PedidoForm from '@/components/PedidoForm' // Importa o componente que criamos

interface PedidoPageProps {
  params: Promise<{ id: string }>
}

export default async function PedidoPage({ params }: PedidoPageProps) {
  // 1. Pega o ID da mesa (Next 15 requer await params)
  const { id } = await params
  
  // 2. Busca produtos reais do banco de dados
  // Ordenados por categoria para ficar organizado
  const produtos = await prisma.produto.findMany({
    orderBy: { categoria: 'asc' }
  })

  // 3. Extrai as categorias únicas existentes no banco
  // Adiciona 'Todos' no início
  const categoriasUnicas = Array.from(new Set(produtos.map(p => p.categoria)))
  const categorias = ['Todos', ...categoriasUnicas]

  // 4. Renderiza o componente Cliente passando os dados
  return (
    <PedidoForm 
      mesaId={id} 
      produtos={produtos} 
      categorias={categorias} 
    />
  )
}