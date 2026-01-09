import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockDeep, mockReset } from 'vitest-mock-extended'
import { PrismaClient } from '@prisma/client'

vi.mock('../../lib/prisma', () => ({
  prisma: mockDeep<PrismaClient>(),
}))

import { prisma } from '../../lib/prisma'
import * as produtosAction from '../produtos'

describe('Produtos', () => {
  const prismaMock = prisma as unknown as ReturnType<typeof mockDeep<PrismaClient>>

  beforeEach(() => {
    mockReset(prismaMock)
  })

  it('Deve buscar produtos ativos', async () => {
    prismaMock.produto.findMany.mockResolvedValue([
      {
        id: 'prod-1',
        nome: 'Produto 1',
        preco: 10,
        descricao: null,
        categoria: 'Bebidas',
        imagemUrl: null,
        ativo: true,
        temEstoqueControlado: true,
        quantidadeEstoque: 10,
        minimoEstoque: 5
      }
    ])

    const result = await produtosAction.buscarProdutos()

    expect(result.sucesso).toBe(true)
    expect(result.dados).toHaveLength(1)
    expect(prismaMock.produto.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { ativo: true },
        orderBy: { categoria: 'asc' }
      })
    )
  })

  it('Deve buscar produtos por categoria', async () => {
    prismaMock.produto.findMany.mockResolvedValue([
      {
        id: 'prod-1',
        nome: 'Produto 1',
        preco: 10,
        descricao: null,
        categoria: 'Bebidas',
        imagemUrl: null,
        ativo: true,
        temEstoqueControlado: true,
        quantidadeEstoque: 10,
        minimoEstoque: 5
      }
    ])

    const result = await produtosAction.buscarPorCategoria('Bebidas')

    expect(result.sucesso).toBe(true)
    expect(result.dados).toHaveLength(1)
    expect(prismaMock.produto.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { ativo: true, categoria: 'Bebidas' }
      })
    )
  })

  it('Deve atualizar o estoque de um produto', async () => {
    prismaMock.produto.update.mockResolvedValue({
      id: 'prod-1',
      nome: 'Produto 1',
      preco: 10,
      descricao: null,
      categoria: 'Bebidas',
      imagemUrl: null,
      ativo: true,
      temEstoqueControlado: true,
      quantidadeEstoque: 20,
      minimoEstoque: 5
    })

    const result = await produtosAction.atualizarEstoque('prod-1', 20)

    expect(result.sucesso).toBe(true)
    expect(result.dados).toEqual(
      expect.objectContaining({ quantidadeEstoque: 20 })
    )
    expect(prismaMock.produto.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'prod-1' },
        data: { quantidadeEstoque: 20 }
      })
    )
  })

  it('Deve salvar um novo produto', async () => {
    prismaMock.produto.create.mockResolvedValue({
      id: 'prod-1',
      nome: 'Produto 1',
      preco: 10,
      descricao: null,
      categoria: 'Bebidas',
      imagemUrl: null,
      ativo: true,
      temEstoqueControlado: true,
      quantidadeEstoque: 10,
      minimoEstoque: 5
    })

    const result = await produtosAction.salvarProduto({
      nome: 'Produto 1',
      preco: 10,
      categoria: 'Bebidas',
      estoque: 10
    })

    expect(result.sucesso).toBe(true)
    expect(prismaMock.produto.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          nome: 'Produto 1',
          preco: 10,
          categoria: 'Bebidas',
          temEstoqueControlado: true,
          quantidadeEstoque: 10
        }
      })
    )
  })

  it('Deve alternar o status de um produto', async () => {
    prismaMock.produto.update.mockResolvedValue({
      id: 'prod-1',
      nome: 'Produto 1',
      preco: 10,
      descricao: null,
      categoria: 'Bebidas',
      imagemUrl: null,
      ativo: false,
      temEstoqueControlado: true,
      quantidadeEstoque: 10,
      minimoEstoque: 5
    })

    const result = await produtosAction.alternarStatusProduto('prod-1', false)

    expect(result.sucesso).toBe(true)
    expect(prismaMock.produto.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'prod-1' },
        data: { ativo: false }
      })
    )
  })
})