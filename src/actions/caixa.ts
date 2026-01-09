'use server'
import { prisma } from './produtos'

export async function realizarFechamentoCaixa(usuarioId: string, valorInformado: number, justificativa?: string) {
  // 1. Somar tudo que foi vendido desde o último fechamento
  // (Para simplificar, vamos somar as vendas do dia atual)
  const hoje = new Date()
  hoje.setHours(0,0,0,0)

  const vendasHoje = await prisma.pedido.findMany({
    where: {
      status: 'FINALIZADO',
      pagamento: {
        dataPagamento: { gte: hoje }
      }
    },
    include: { pagamento: true }
  })

  const totalEsperado = vendasHoje.reduce((acc, p) => acc + (p.pagamento?.valorPago || 0), 0)
  const diferenca = valorInformado - totalEsperado

  // Validação do Requisito: Exigir justificativa se houver diferença
  if (Math.abs(diferenca) > 0.50 && !justificativa) {
    return { sucesso: false, erro: "Divergência de caixa detectada. Justificativa obrigatória." }
  }

  // Gravar fechamento
  await prisma.fechamentoCaixa.create({
    data: {
      valorTotalEsperado: totalEsperado,
      valorTotalReal: valorInformado,
      diferenca,
      justificativa: justificativa || '',
      usuarioId
    }
  })

  return { sucesso: true, dados: { esperado: totalEsperado, diferenca } }
}