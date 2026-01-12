'use server'
import { prisma } from '@/lib/prisma'

// Registrar pagamento e finalizar o ciclo do pedido
export async function registrarPagamento(pedidoId: string, metodo: 'DINHEIRO' | 'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO', valorPago: number) {
  try {
    // 1. Validar se o pedido existe e não está pago
    const pedido = await prisma.pedido.findUnique({ where: { id: pedidoId } })
    if (!pedido) return { sucesso: false, erro: "Pedido não encontrado" }
    if (pedido.status === 'FINALIZADO') return { sucesso: false, erro: "Pedido já foi pago" }

    // 2. Transação: Salvar Pagamento + Atualizar Status + Liberar Mesa
    await prisma.$transaction(async (tx) => {
      // Cria registro financeiro
      await tx.pagamento.create({
        data: {
          pedidoId,
          formaPagamento: metodo,
          valorPago
        }
      })

      // Finaliza pedido
      await tx.pedido.update({
        where: { id: pedidoId },
        data: { status: 'FINALIZADO' }
      })
      await tx.mesa.update({
        where: { id: pedido.mesaId },
        data: { status: 'LIVRE' }
      })
    })

    return { sucesso: true }
  } catch (e) {
    console.error(e)
    return { sucesso: false, erro: "Erro ao registrar pagamento" }
  }
}