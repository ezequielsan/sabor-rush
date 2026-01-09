import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockDeep, mockReset } from 'vitest-mock-extended'
import { PrismaClient } from '@prisma/client'

import { prisma } from '../produtos'
import * as clientesAction from '../clientes'
import * as usuariosAction from '../usuarios'

vi.mock('../produtos', async () => {
  const mockExtended = await import('vitest-mock-extended')
  return {
    __esModule: true,
    prisma: mockExtended.mockDeep<PrismaClient>(),
  }
})

describe('Cadastros Gerais', () => {
  const prismaMock = prisma as unknown as ReturnType<typeof mockDeep<PrismaClient>>

  beforeEach(() => {
    mockReset(prismaMock)
  })

  it('Deve cadastrar cliente novo', async () => {
    // Simula que não encontrou telefone duplicado
    prismaMock.cliente.findUnique.mockResolvedValue(null)
    
    prismaMock.cliente.create.mockResolvedValue({ id: 'c1' } as any)

    const result = await clientesAction.cadastrarCliente('Cliente Teste', '999999999')

    expect(result.sucesso).toBe(true)
    expect(prismaMock.cliente.create).toHaveBeenCalled()
  })

  it('Deve impedir cadastro de usuário com email duplicado', async () => {
    // Simula que já existe o email
    prismaMock.usuario.findUnique.mockResolvedValue({ id: 'u1' } as any)

    const result = await usuariosAction.criarUsuario('Nome', 'email@existente.com', '123', 'GARCOM')

    expect(result.sucesso).toBe(false)
    expect(prismaMock.usuario.create).not.toHaveBeenCalled()
  })
})