import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockDeep, mockReset } from 'vitest-mock-extended'
import { PrismaClient } from '@prisma/client'

vi.mock('../../lib/prisma', () => ({
  prisma: mockDeep<PrismaClient>(),
}))

import { prisma } from '../../lib/prisma'
import * as usuariosAction from '../usuarios'

describe('Usuários', () => {
  const prismaMock = prisma as unknown as ReturnType<typeof mockDeep<PrismaClient>>

  beforeEach(() => {
    mockReset(prismaMock)
  })

  it('Deve criar um novo usuário', async () => {
    prismaMock.usuario.findUnique.mockResolvedValue(null)
    prismaMock.usuario.create.mockResolvedValue({
      id: 'user-1',
      nome: 'João Silva',
      email: 'joao@email.com',
      senhaHash: 'senha123',
      perfil: 'ADMIN'
    })

    const result = await usuariosAction.criarUsuario('João Silva', 'joao@email.com', 'senha123', 'ADMIN')

    expect(result.sucesso).toBe(true)
    expect(prismaMock.usuario.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: 'joao@email.com' } })
    )
    expect(prismaMock.usuario.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          nome: 'João Silva',
          email: 'joao@email.com',
          senhaHash: 'senha123',
          perfil: 'ADMIN'
        }
      })
    )
  })

  it('Deve retornar erro ao criar usuário com email duplicado', async () => {
    prismaMock.usuario.findUnique.mockResolvedValue({
      id: 'user-1',
      nome: 'João Silva',
      email: 'joao@email.com',
      senhaHash: 'senha123',
      perfil: 'ADMIN'
    })

    const result = await usuariosAction.criarUsuario('João Silva', 'joao@email.com', 'senha123', 'ADMIN')

    expect(result.sucesso).toBe(false)
    expect(result.erro).toBe('Email já cadastrado')
    expect(prismaMock.usuario.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: 'joao@email.com' } })
    )
  })

  it('Deve listar usuários ordenados por nome', async () => {
    prismaMock.usuario.findMany.mockResolvedValue([
      {
        id: 'user-1',
        nome: 'Ana Silva',
        email: 'ana@email.com',
        senhaHash: 'senha123',
        perfil: 'GARCOM'
      },
      {
        id: 'user-2',
        nome: 'João Silva',
        email: 'joao@email.com',
        senhaHash: 'senha123',
        perfil: 'ADMIN'
      }
    ])

    const result = await usuariosAction.listarUsuarios()

    expect(result).toHaveLength(2)
    expect(result[0].nome).toBe('Ana Silva')
    expect(result[1].nome).toBe('João Silva')
    expect(prismaMock.usuario.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { nome: 'asc' } })
    )
  })
})