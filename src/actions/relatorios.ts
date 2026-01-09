'use server'
import { prisma } from './produtos'

// [RF05] Relatório de Estoque Baixo
export async function relatorioEstoqueBaixo() {
  try {
    // Busca produtos onde estoque <= minimoEstoque
    const produtos = await prisma.produto.findMany({
      where: {
        temEstoqueControlado: true,
        quantidadeEstoque: { lte: 5 } // Idealmente usar campo 'minimoEstoque' se tiver criado, senão hardcode 5
      }
    })
    return { sucesso: true, dados: produtos }
  } catch (e) {
    return { sucesso: false, erro: "Erro ao gerar relatório." }
  }
}

// [RF06] Dashboard de Vendas (Simples)
export async function relatorioVendasDoDia() {
  const hoje = new Date()
  hoje.setHours(0,0,0,0)

  const vendas = await prisma.pedido.findMany({
    where: {
      status: 'FINALIZADO',
      dataCriacao: { gte: hoje }
    },
    include: { pagamento: true }
  })

  const resumo = {
    totalFaturado: vendas.reduce((acc: number, v: { totalFinal?: number }) => acc + (v.totalFinal || 0), 0),
    qtdPedidos: vendas.length,
    ticketMedio: 0
  }
  
  if (vendas.length > 0) resumo.ticketMedio = resumo.totalFaturado / vendas.length

  return { sucesso: true, dados: resumo }
}