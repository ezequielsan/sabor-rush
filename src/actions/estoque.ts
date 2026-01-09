'use server'
import { prisma } from './produtos'

export async function ajusteManualEstoque(produtoId: string, qtd: number, tipo: 'ENTRADA_COMPRA' | 'AJUSTE_PERDA', justificativa: string, usuarioId: string) {
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Atualiza quantidade
      const operacao = (tipo === 'ENTRADA_COMPRA') ? { increment: qtd } : { decrement: qtd }
      
      await tx.produto.update({
        where: { id: produtoId },
        data: { quantidadeEstoque: operacao }
      })

      // 2. Gera Log [RF12]
      await tx.movimentacaoEstoque.create({
        data: {
          tipo,
          quantidade: qtd,
          justificativa,
          produtoId,
          usuarioId
        }
      })
    })
    return { sucesso: true }
  } catch (e) {
    return { sucesso: false, erro: "Erro ao ajustar estoque" }
  }
}