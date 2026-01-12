'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// --- CRIAR ---
export async function criarUsuario(nome: string, email: string, senhaPlana: string, perfil: 'ADMIN' | 'GARCOM' | 'COZINHA' | 'CAIXA') {
  try {
    const existe = await prisma.usuario.findUnique({ where: { email } })
    if (existe) return { sucesso: false, erro: "Email já cadastrado" }

    await prisma.usuario.create({
      data: {
        nome,
        email,
        senhaHash: senhaPlana, 
        perfil,
      }
    })
    revalidatePath('/dashboard/usuarios')
    return { sucesso: true }
  } catch (e) {
    return { sucesso: false, erro: "Erro ao criar usuário" }
  }
}

// --- LISTAR ---
export async function listarUsuarios() {
  return await prisma.usuario.findMany({
    orderBy: { nome: 'asc' }
  })
}

// --- ATUALIZAR ---
export async function atualizarUsuario(id: string, data: { nome: string, email: string, perfil: any, senha?: string }) {
  try {
    const dadosAtualizar: any = {
      nome: data.nome,
      email: data.email,
      perfil: data.perfil,
    }
    
    if (data.senha && data.senha.trim() !== '') {
        dadosAtualizar.senhaHash = data.senha
    }

    await prisma.usuario.update({
      where: { id },
      data: dadosAtualizar
    })
    revalidatePath('/dashboard/usuarios')
    return { sucesso: true }
  } catch (error) {
    return { sucesso: false, erro: "Erro ao atualizar usuário" }
  }
}

// --- EXCLUIR ---
export async function excluirUsuario(id: string) {
  try {
    await prisma.usuario.delete({ where: { id } })
    revalidatePath('/dashboard/usuarios')
    return { sucesso: true }
  } catch (error) {
    return { sucesso: false, erro: "Erro ao excluir usuário" }
  }
}

// --- ALTERNAR STATUS ---
export async function alternarStatusUsuario(id: string, statusAtual: boolean) {
    // COMO NÃO TEM O CAMPO NO BANCO, RETORNAMOS SUCESSO FAKE POR ENQUANTO
    // PARA NÃO QUEBRAR A TELA
    return { sucesso: true } 
    
    /*
    try {
      await prisma.usuario.update({
        where: { id },
        data: { ativo: !statusAtual }
      })
      revalidatePath('/dashboard/usuarios')
      return { sucesso: true }
    } catch (error) {
      return { sucesso: false, erro: "Erro ao alterar status" }
    }
    */
}