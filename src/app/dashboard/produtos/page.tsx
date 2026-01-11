import { listarTodosProdutos } from '@/actions/produtos'
import ProdutosList from '@/components/ProdutosList'

export default async function ProdutosPage() {
  // Busca TODOS (ativos e inativos) para o admin ver
  const { dados } = await listarTodosProdutos()
  const produtos = dados || []

  return (
    <div className="h-full overflow-hidden p-2">
      <ProdutosList produtosIniciais={produtos} />
    </div>
  )
}