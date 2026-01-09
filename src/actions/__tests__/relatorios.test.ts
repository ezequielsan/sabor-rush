import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockDeep, mockReset } from 'vitest-mock-extended'
import { PrismaClient } from '@prisma/client'

// Mock da instância centralizada do Prisma
vi.mock('../../lib/prisma', () => ({
  prisma: mockDeep<PrismaClient>(),
}))

import { prisma } from '../../lib/prisma'
import * as relatoriosAction from '../relatorios'

describe('Relatórios', () => {
  const prismaMock = prisma as unknown as ReturnType<typeof mockDeep<PrismaClient>>

  beforeEach(() => {
    mockReset(prismaMock)
  })

  it('Deve gerar relatório de estoque baixo', async () => {
    prismaMock.produto.findMany.mockResolvedValue([
        {
          id: 'prod-1',
          nome: 'Item em falta',
          preco: 10,
          descricao: null,
          categoria: 'Bebidas',
          imagemUrl: null,
          ativo: true,
          temEstoqueControlado: true,
          quantidadeEstoque: 2,
          minimoEstoque: 5
        }
    ])

    const result = await relatoriosAction.relatorioEstoqueBaixo()

    expect(result.sucesso).toBe(true)
    expect(prismaMock.produto.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
            where: {
                temEstoqueControlado: true,
                quantidadeEstoque: { lte: 5 }
            }
        })
    )
  })

  it('Deve gerar relatório de vendas do dia', async () => {
    prismaMock.pedido.findMany.mockResolvedValue([
        {
          id: 'pedido-1',
          dataCriacao: new Date(),
          status: 'FINALIZADO',
          mesaId: 'mesa-1',
          clienteId: null,
          subtotal: 50,
          taxaServico: 0,
          desconto: 0,
          totalFinal: 50,
          cupomId: null,
          pagamento: []
        },
        {
          id: 'pedido-2',
          dataCriacao: new Date(),
          status: 'FINALIZADO',
          mesaId: 'mesa-2',
          clienteId: null,
          subtotal: 50,
          taxaServico: 0,
          desconto: 0,
          totalFinal: 50,
          cupomId: null,
          pagamento: []
        }
      ] as any) // Ensure type compatibility

    const result = await relatoriosAction.relatorioVendasDoDia()

    expect(result.sucesso).toBe(true)
    if (result.sucesso && result.dados) {
        expect(result.dados.totalFaturado).toBe(100)
    }
    expect(prismaMock.pedido.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
            where: {
                status: 'FINALIZADO',
                dataCriacao: { gte: expect.any(Date) }
            },
            include: { pagamento: true }
        })
    )
  })
})