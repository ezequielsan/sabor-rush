import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockDeep, mockReset } from 'vitest-mock-extended'
import { PrismaClient } from '@prisma/client'

vi.mock('../../lib/prisma', () => ({
  prisma: mockDeep<PrismaClient>(),
}))

import { prisma } from '../../lib/prisma'
import * as caixaAction from '../caixa'

describe('Caixa', () => {
  const prismaMock = prisma as unknown as ReturnType<typeof mockDeep<PrismaClient>>

  beforeEach(() => {
    mockReset(prismaMock)
  })

  it('Deve realizar fechamento de caixa com sucesso', async () => {
    prismaMock.pedido.findMany.mockResolvedValue([
      {
        id: 'pedido-1',
        status: 'FINALIZADO',
        pagamento: { valorPago: 100, dataPagamento: new Date() }
      },
      {
        id: 'pedido-2',
        status: 'FINALIZADO',
        pagamento: { valorPago: 50, dataPagamento: new Date() }
      }
    ])
    prismaMock.fechamentoCaixa.create.mockResolvedValue({
      id: 'fechamento-1',
      valorTotalEsperado: 150,
      valorTotalReal: 150,
      diferenca: 0,
      justificativa: '',
      usuarioId: 'user-1'
    })

    const result = await caixaAction.realizarFechamentoCaixa('user-1', 150)

    expect(result.sucesso).toBe(true)
    expect(result.dados).toEqual(
      expect.objectContaining({ esperado: 150, diferenca: 0 })
    )
    expect(prismaMock.pedido.findMany).toHaveBeenCalled()
    expect(prismaMock.fechamentoCaixa.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          valorTotalEsperado: 150,
          valorTotalReal: 150,
          diferenca: 0,
          justificativa: '',
          usuarioId: 'user-1'
        }
      })
    )
  })

  it('Deve retornar erro ao realizar fechamento com divergência sem justificativa', async () => {
    prismaMock.pedido.findMany.mockResolvedValue([
      {
        id: 'pedido-1',
        status: 'FINALIZADO',
        pagamento: { valorPago: 100, dataPagamento: new Date() }
      }
    ])

    const result = await caixaAction.realizarFechamentoCaixa('user-1', 90)

    expect(result.sucesso).toBe(false)
    expect(result.erro).toBe('Divergência de caixa detectada. Justificativa obrigatória.')
    expect(prismaMock.pedido.findMany).toHaveBeenCalled()
  })

  it('Deve realizar fechamento com divergência e justificativa', async () => {
    prismaMock.pedido.findMany.mockResolvedValue([
      {
        id: 'pedido-1',
        status: 'FINALIZADO',
        pagamento: { valorPago: 100, dataPagamento: new Date() }
      }
    ])
    prismaMock.fechamentoCaixa.create.mockResolvedValue({
      id: 'fechamento-1',
      valorTotalEsperado: 100,
      valorTotalReal: 90,
      diferenca: -10,
      justificativa: 'Erro de contagem',
      usuarioId: 'user-1'
    })

    const result = await caixaAction.realizarFechamentoCaixa('user-1', 90, 'Erro de contagem')

    expect(result.sucesso).toBe(true)
    expect(result.dados).toEqual(
      expect.objectContaining({ esperado: 100, diferenca: -10 })
    )
    expect(prismaMock.fechamentoCaixa.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          valorTotalEsperado: 100,
          valorTotalReal: 90,
          diferenca: -10,
          justificativa: 'Erro de contagem',
          usuarioId: 'user-1'
        }
      })
    )
  })
})