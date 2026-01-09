import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockDeep, mockReset } from 'vitest-mock-extended'
import { PrismaClient } from '@prisma/client'

import { prisma } from '../produtos'
import * as authAction from '../auth'

vi.mock('../produtos', async () => {
  const mockExtended = await import('vitest-mock-extended')
  return {
    __esModule: true,
    prisma: mockExtended.mockDeep<PrismaClient>(),
  }
})

describe('Autenticação', () => {
  const prismaMock = prisma as unknown as ReturnType<typeof mockDeep<PrismaClient>>

  beforeEach(() => {
    mockReset(prismaMock)
  })

  it('Deve realizar login com sucesso', async () => {
    prismaMock.usuario.findUnique.mockResolvedValue({
      id: 'u1',
      nome: 'Garçom',
      email: 'teste@sabor.com',
      senhaHash: '1234', // Senha simulada no banco
      perfil: 'GARCOM'
    } as any)

    const result = await authAction.realizarLogin('teste@sabor.com', '1234')

    expect(result.sucesso).toBe(true)
    if (result.sucesso) {
        expect(result.usuario?.perfil).toBe('GARCOM')
    }
  })

  it('Deve negar login com senha errada', async () => {
    prismaMock.usuario.findUnique.mockResolvedValue({
      email: 'teste@sabor.com',
      senhaHash: '1234'
    } as any)

    const result = await authAction.realizarLogin('teste@sabor.com', 'senha_errada')

    expect(result.sucesso).toBe(false)
  })
})