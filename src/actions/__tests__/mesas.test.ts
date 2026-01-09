import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockDeep, mockReset } from 'vitest-mock-extended'
import { PrismaClient } from '@prisma/client'

// Importamos a instância do prisma
import { prisma } from '../produtos'
import * as mesasAction from '../mesas'

// Setup do Mock
vi.mock('../produtos', async () => {
  const mockExtended = await import('vitest-mock-extended')
  return {
    __esModule: true,
    prisma: mockExtended.mockDeep<PrismaClient>(),
  }
})

describe('Módulo de Mesas', () => {
  const prismaMock = prisma as unknown as ReturnType<typeof mockDeep<PrismaClient>>

  beforeEach(() => {
    mockReset(prismaMock)
  })

  it('Deve listar mesas calculando o total da conta corretamente', async () => {
    // ARRANGE
    prismaMock.mesa.findMany.mockResolvedValue([
      {
        id: 'm1', numero: 1, status: 'OCUPADA',
        // --- CORREÇÃO AQUI ---
        // Mudamos de 'total' para 'totalFinal' para bater com o Schema e a Action
        pedidos: [{ totalFinal: 50 }, { totalFinal: 20 }] 
      },
      {
        id: 'm2', numero: 2, status: 'LIVRE',
        pedidos: []
      }
    ] as any)

    // ACT
    const result = await mesasAction.listarMesas()

    // ASSERT
    expect(result.sucesso).toBe(true)
    
    const dados = (result as any).dados
    expect(dados[0].numero).toBe(1)
    expect(dados[0].totalConta).toBe(70) // 50 + 20 = 70. Agora vai bater!
    expect(dados[1].totalConta).toBe(0)
  })

  it('Deve transferir mesa (origem -> destino)', async () => {
    // Mock da transação
    prismaMock.$transaction.mockImplementation(async (cb) => {
        // @ts-ignore
        return cb(prismaMock)
    })

    prismaMock.pedido.findMany.mockResolvedValue([{ id: 'p1' }] as any)

    // ACT
    const result = await mesasAction.transferirMesa('mesa-origem', 'mesa-destino')

    // ASSERT
    expect(result.sucesso).toBe(true)

    expect(prismaMock.pedido.updateMany).toHaveBeenCalledWith({
      where: { mesaId: 'mesa-origem', status: { not: 'FINALIZADO' } },
      data: { mesaId: 'mesa-destino' }
    })

    expect(prismaMock.mesa.update).toHaveBeenCalledWith({
      where: { id: 'mesa-origem' },
      data: { status: 'LIVRE' }
    })
  })

  it('Deve ocupar uma mesa', async () => {
    prismaMock.mesa.update.mockResolvedValue({ id: 'm1', status: 'OCUPADA' } as any)
    
    const result = await mesasAction.ocuparMesa('m1')
    
    expect(result.sucesso).toBe(true)
    expect(prismaMock.mesa.update).toHaveBeenCalledWith({
        where: { id: 'm1' },
        data: { status: 'OCUPADA' }
    })
  })

  it('Deve liberar uma mesa', async () => {
    prismaMock.mesa.update.mockResolvedValue({ id: 'm1', status: 'LIVRE' } as any)
    
    const result = await mesasAction.liberarMesa('m1')
    
    expect(result.sucesso).toBe(true)
    expect(prismaMock.mesa.update).toHaveBeenCalledWith({
        where: { id: 'm1' },
        data: { status: 'LIVRE' }
    })
  })
  
  it('Deve unir mesas', async () => {
    prismaMock.$transaction.mockImplementation(async (cb) => {
        // @ts-ignore
        return cb(prismaMock)
    })
    
    // Simula mesas ocupadas
    prismaMock.mesa.findUnique.mockResolvedValue({ status: 'OCUPADA' } as any)
    
    const result = await mesasAction.unirMesas('origem', 'destino')
    
    expect(result.sucesso).toBe(true)
    expect(prismaMock.pedido.updateMany).toHaveBeenCalled() // Moveu pedidos?
  })
})