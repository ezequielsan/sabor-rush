import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import FechamentoForm from '@/components/FechamentoForm'

interface FechamentoPageProps {
  params: Promise<{ id: string }>
}

export default async function FechamentoPage({ params }: FechamentoPageProps) {
  const { id } = await params

  // 1. Busca a mesa e seus pedidos abertos
  const mesa = await prisma.mesa.findUnique({
    where: { id },
    include: {
      pedidos: {
        where: { status: { not: 'FINALIZADO' } },
        include: { itens: { include: { produto: true } } }
      }
    }
  })

  if (!mesa || mesa.status === 'LIVRE') {
    redirect('/dashboard')
  }

  // 2. Processa os dados para o Resumo
  const itensMap = new Map<string, { nome: string; quantidade: number; total: number }>()
  
  let subtotalGeral = 0

  mesa.pedidos.forEach(pedido => {
    pedido.itens.forEach(item => {
      const nome = item.produto.nome
      
      const precoReal = item.precoNaHora ? Number(item.precoNaHora) : Number(item.produto.preco)
      
      const totalItem = precoReal * item.quantidade
      
      subtotalGeral += totalItem

      if (itensMap.has(nome)) {
        const existente = itensMap.get(nome)!
        existente.quantidade += item.quantidade
        existente.total += totalItem
      } else {
        itensMap.set(nome, {
          nome,
          quantidade: item.quantidade,
          total: totalItem
        })
      }
    })
  })

  const itensResumo = Array.from(itensMap.values())
  const taxaServico = subtotalGeral * 0.10
  const totalFinal = subtotalGeral + taxaServico

  // 3. Renderiza o formulário
  return (
    <FechamentoForm 
      mesa={{ id: mesa.id, nome: `Mesa ${mesa.numero}`, numero: mesa.numero }}
      itens={itensResumo}
      totais={{ subtotal: subtotalGeral, taxa: taxaServico, totalFinal }}
    />
  )
}