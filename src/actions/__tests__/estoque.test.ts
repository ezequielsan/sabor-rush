import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockDeep, mockReset } from 'vitest-mock-extended'
import { PrismaClient } from '@prisma/client'

import { prisma } from '../produtos'
import * as estoqueAction from '../estoque'

vi.mock('../produtos', async () => {
  const mockExtended = await import('vitest-mock-extended')
  return {
    __esModule: true,
    prisma: mockExtended.mockDeep<PrismaClient>(),
  }
})

describe('Módulo de Estoque', () => {
  const prismaMock = prisma as unknown as ReturnType<typeof mockDeep<PrismaClient>>

  beforeEach(() => {
    mockReset(prismaMock)
  })

  it('Deve criar log de auditoria ao ajustar estoque', async () => {
    prismaMock.$transaction.mockImplementation(async (cb) => {
        // @ts-ignore
        return cb(prismaMock)
    })

    const result = await estoqueAction.ajusteManualEstoque(
        'prod-1', 
        5, 
        'AJUSTE_PERDA', 
        'Tomate estragou', 
        'user-admin'
    )

    expect(result.sucesso).toBe(true)

    // Verifica update do produto (decremento)
    expect(prismaMock.produto.update).toHaveBeenCalledWith(
        expect.objectContaining({
            data: { quantidadeEstoque: { decrement: 5 } }
        })
    )

    // Verifica criação do log
    expect(prismaMock.movimentacaoEstoque.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
            tipo: 'AJUSTE_PERDA',
            justificativa: 'Tomate estragou'
        })
      })
    )
  })

  it('Deve retornar erro ao ajustar estoque com produto inexistente', async () => {
    prismaMock.$transaction.mockImplementation(async (callback) => {
      await callback(prismaMock)
    })
    prismaMock.produto.update.mockRejectedValue(new Error('Produto não encontrado'))

    const result = await estoqueAction.ajusteManualEstoque('prod-999', 10, 'ENTRADA_COMPRA', 'Compra de fornecedor', 'user-1')

    expect(result.sucesso).toBe(false)
    expect(result.erro).toBe('Erro ao ajustar estoque')
    expect(prismaMock.produto.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'prod-999' },
        data: { quantidadeEstoque: { increment: 10 } }
      })
    )
  })

  it('Deve retornar erro ao ajustar estoque com transação falha', async () => {
    prismaMock.$transaction.mockRejectedValue(new Error('Erro na transação'))

    const result = await estoqueAction.ajusteManualEstoque('prod-1', 10, 'ENTRADA_COMPRA', 'Compra de fornecedor', 'user-1')

    expect(result.sucesso).toBe(false)
    expect(result.erro).toBe('Erro ao ajustar estoque')
    expect(prismaMock.$transaction).toHaveBeenCalled()
  })
})