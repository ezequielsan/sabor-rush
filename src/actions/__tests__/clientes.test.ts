import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockDeep, mockReset } from 'vitest-mock-extended'
import { PrismaClient } from '@prisma/client'

vi.mock('../../lib/prisma', () => ({
  prisma: mockDeep<PrismaClient>(),
}))

import { prisma } from '../../lib/prisma'
import * as clientesAction from '../clientes'

describe('Clientes', () => {
  const prismaMock = prisma as unknown as ReturnType<typeof mockDeep<PrismaClient>>

  beforeEach(() => {
    mockReset(prismaMock)
  })

  it('Deve cadastrar um novo cliente', async () => {
    prismaMock.cliente.findUnique.mockResolvedValue(null)
    prismaMock.cliente.create.mockResolvedValue({
      id: 'cliente-1',
      nome: 'João Silva',
      telefone: '123456789'
    })

    const result = await clientesAction.cadastrarCliente('João Silva', '123456789')

    expect(result.sucesso).toBe(true)
    expect(prismaMock.cliente.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { telefone: '123456789' } })
    )
    expect(prismaMock.cliente.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: { nome: 'João Silva', telefone: '123456789' } })
    )
  })

  it('Deve retornar erro ao cadastrar cliente com telefone duplicado', async () => {
    prismaMock.cliente.findUnique.mockResolvedValue({
      id: 'cliente-1',
      nome: 'João Silva',
      telefone: '123456789'
    })

    const result = await clientesAction.cadastrarCliente('João Silva', '123456789')

    expect(result.sucesso).toBe(false)
    expect(result.erro).toBe('Telefone já cadastrado.')
    expect(prismaMock.cliente.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { telefone: '123456789' } })
    )
  })

  it('Deve buscar cliente pelo telefone', async () => {
    prismaMock.cliente.findUnique.mockResolvedValue({
      id: 'cliente-1',
      nome: 'João Silva',
      telefone: '123456789'
    })

    const result = await clientesAction.buscarClientePorTelefone('123456789')

    expect(result).toEqual({
      id: 'cliente-1',
      nome: 'João Silva',
      telefone: '123456789'
    })
    expect(prismaMock.cliente.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { telefone: '123456789' } })
    )
  })

  it('Deve obter histórico de pedidos do cliente', async () => {
    prismaMock.pedido.findMany.mockResolvedValue([
      {
        id: 'pedido-1',
        clienteId: 'cliente-1',
        status: 'FINALIZADO',
        itens: [
          {
            produto: { id: 'prod-1', nome: 'Produto 1', preco: 10 },
            quantidade: 2
          }
        ],
        dataCriacao: new Date()
      }
    ])

    const result = await clientesAction.obterHistoricoCliente('cliente-1')

    expect(result.sucesso).toBe(true)
    expect(result.dados).toHaveLength(1)
    expect(prismaMock.pedido.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { clienteId: 'cliente-1', status: 'FINALIZADO' },
        include: { itens: { include: { produto: true } } },
        orderBy: { dataCriacao: 'desc' }
      })
    )
  })
})