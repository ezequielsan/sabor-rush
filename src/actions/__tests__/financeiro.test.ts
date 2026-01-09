import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockDeep, mockReset } from 'vitest-mock-extended'
import { PrismaClient } from '@prisma/client'

import { prisma } from '../produtos'
import * as pagamentosAction from '../pagamentos'
import * as caixaAction from '../caixa'

vi.mock('../produtos', async () => {
  const mockExtended = await import('vitest-mock-extended')
  return {
    __esModule: true,
    prisma: mockExtended.mockDeep<PrismaClient>(),
  }
})

describe('Módulo Financeiro', () => {
  const prismaMock = prisma as unknown as ReturnType<typeof mockDeep<PrismaClient>>

  beforeEach(() => {
    mockReset(prismaMock)
  })

  // --- PAGAMENTOS ---
  it('Deve registrar pagamento e finalizar pedido', async () => {
    prismaMock.$transaction.mockImplementation(async (cb) => {
        // @ts-ignore
        return cb(prismaMock)
    })

    // Simula pedido existente
    prismaMock.pedido.findUnique.mockResolvedValue({
      id: 'ped-1', status: 'ENTREGUE', mesaId: 'mesa-5'
    } as any)

    const result = await pagamentosAction.registrarPagamento('ped-1', 'PIX', 50.00)

    expect(result.sucesso).toBe(true)
    
    // Verifica se criou o pagamento
    expect(prismaMock.pagamento.create).toHaveBeenCalled()
    
    // Verifica se finalizou o pedido
    expect(prismaMock.pedido.update).toHaveBeenCalledWith({
      where: { id: 'ped-1' },
      data: { status: 'FINALIZADO' }
    })
    
    // Verifica se liberou a mesa
    expect(prismaMock.mesa.update).toHaveBeenCalledWith({
      where: { id: 'mesa-5' },
      data: { status: 'LIVRE' }
    })
  })

  // --- CAIXA ---
  it('Deve exigir justificativa se houver diferença no caixa', async () => {
    // Simula vendas do dia = 100 reais
    prismaMock.pedido.findMany.mockResolvedValue([
      { pagamento: { valorPago: 100 } }
    ] as any)

    // Usuário informa 90 (Falta 10) e NÃO justifica
    const result = await caixaAction.realizarFechamentoCaixa('user-1', 90, '')

    expect(result.sucesso).toBe(false)
    if (!result.sucesso) {
       expect((result as any).erro).toContain('Justificativa')
    }
  })

  it('Deve aceitar fechamento com diferença SE houver justificativa', async () => {
    prismaMock.pedido.findMany.mockResolvedValue([
      { pagamento: { valorPago: 100 } }
    ] as any)

    // Usuário informa 90 e justifica
    const result = await caixaAction.realizarFechamentoCaixa('user-1', 90, 'Troco errado')

    expect(result.sucesso).toBe(true)
    expect(prismaMock.fechamentoCaixa.create).toHaveBeenCalled()
  })
})