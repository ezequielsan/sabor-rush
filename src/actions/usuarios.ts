'use server'
import { prisma } from './produtos'

export async function criarUsuario(nome: string, email: string, senhaPlana: string, perfil: 'ADMIN' | 'GARCOM' | 'COZINHA' | 'CAIXA') {
  try {
    const existe = await prisma.usuario.findUnique({ where: { email } })
    if (existe) return { sucesso: false, erro: "Email já cadastrado" }

    await prisma.usuario.create({
      data: {
        nome,
        email,
        senhaHash: senhaPlana, // Em produção real, criptografar aqui
        perfil
      }
    })
    return { sucesso: true }
  } catch (e) {
    return { sucesso: false, erro: "Erro ao criar usuário" }
  }
}

export async function listarUsuarios() {
  return await prisma.usuario.findMany({
    orderBy: { nome: 'asc' }
  })
}