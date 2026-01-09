import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockDeep, mockReset } from 'vitest-mock-extended'
import { PrismaClient } from '@prisma/client'

// 1. Mock da instância centralizada do Prisma
vi.mock('../../lib/prisma', () => ({
  prisma: mockDeep<PrismaClient>(),
}))

import { prisma } from '../../lib/prisma'
import * as pedidosAction from '../pedidos'

describe('Módulo de Pedidos', () => {
  const prismaMock = prisma as unknown as ReturnType<typeof mockDeep<PrismaClient>>

  beforeEach(() => {
    mockReset(prismaMock)
  })

  it('Deve criar um pedido com sucesso e baixar estoque', async () => {
    // Mock da transação
    prismaMock.$transaction.mockImplementation(async (callback) => {
      // @ts-ignore
      return callback(prismaMock)
    })

    prismaMock.produto.findUnique.mockResolvedValue({
      id: 'prod-1', nome: 'Cola', preco: 10,
      temEstoqueControlado: true, quantidadeEstoque: 10
    } as any)

    prismaMock.pedido.create.mockResolvedValue({ id: 'pedido-123' } as any)
    
    const result = await pedidosAction.criarPedido('mesa-1', [
        { produtoId: 'prod-1', quantidade: 2, precoUnitario: 10 }
    ])

    expect(result.sucesso).toBe(true)
    
    if (result.sucesso) {
        const r = result as { sucesso: true, id: string }
        expect(r.id).toBe('pedido-123')
    }

    expect(prismaMock.produto.update).toHaveBeenCalledWith({
      where: { id: 'prod-1' },
      data: { quantidadeEstoque: { decrement: 2 } }
    })
  })

  it('Deve impedir venda se não houver estoque', async () => {
    prismaMock.$transaction.mockImplementation(async (cb) => cb(prismaMock))

    prismaMock.produto.findUnique.mockResolvedValue({
      id: 'prod-sem', nome: 'Picanha',
      temEstoqueControlado: true, quantidadeEstoque: 2
    } as any)

    const result = await pedidosAction.criarPedido('mesa-1', [
        { produtoId: 'prod-sem', quantidade: 5, precoUnitario: 10 }
    ])

    expect(result.sucesso).toBe(false)
  })
  
  it('Deve buscar pedidos para a cozinha', async () => {
    prismaMock.pedido.findMany.mockResolvedValue([
        { id: 'p1', status: 'RECEBIDO' }
    ] as any)
    
    const result = await pedidosAction.buscarPedidosCozinha()
    
    expect(result.sucesso).toBe(true)
    expect(prismaMock.pedido.findMany).toHaveBeenCalled()
  })

  it('Deve atualizar status do pedido', async () => {
    prismaMock.pedido.update.mockResolvedValue({ id: 'p1' } as any)
    
    const result = await pedidosAction.atualizarStatusPedido('p1', 'PRONTO')
    
    expect(result.sucesso).toBe(true)
    expect(prismaMock.pedido.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { status: 'PRONTO' }
    })
  })

  it('Deve atualizar o status de um pedido', async () => {
    prismaMock.pedido.update.mockResolvedValue({
      id: 'pedido-1',
      dataCriacao: new Date(),
      status: 'PRONTO',
      mesaId: 'mesa-1',
      clienteId: null,
      subtotal: 100,
      taxaServico: 10,
      desconto: 0,
      totalFinal: 110,
      cupomId: null
    })

    const result = await pedidosAction.atualizarStatusPedido('pedido-1', 'PRONTO')

    expect(result.sucesso).toBe(true)
    expect(prismaMock.pedido.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'pedido-1' },
        data: { status: 'PRONTO' }
      })
    )
  })

  it('Deve aplicar taxas em um pedido', async () => {
    prismaMock.pedido.findUnique.mockResolvedValue({
      id: 'pedido-1',
      dataCriacao: new Date(),
      status: 'RECEBIDO',
      mesaId: 'mesa-1',
      clienteId: null,
      subtotal: 100,
      taxaServico: 0,
      desconto: 0,
      totalFinal: 100,
      cupomId: null
    })
    prismaMock.pedido.update.mockResolvedValue({
      id: 'pedido-1',
      dataCriacao: new Date(),
      status: 'RECEBIDO',
      mesaId: 'mesa-1',
      clienteId: null,
      subtotal: 100,
      taxaServico: 10,
      desconto: 5,
      totalFinal: 105,
      cupomId: null
    })

    const result = await pedidosAction.aplicarTaxas('pedido-1', 10, 5)

    expect(result.sucesso).toBe(true)
    expect(prismaMock.pedido.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'pedido-1' } })
    )
    expect(prismaMock.pedido.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'pedido-1' },
        data: { taxaServico: 10, desconto: 5, totalFinal: 105 }
      })
    )
  })
})