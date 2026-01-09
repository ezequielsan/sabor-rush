'use server'

import { prisma } from './produtos'
import { cookies } from 'next/headers'

// [RF11] Login Simples (Com Cookie de Sessão)
export async function realizarLogin(email: string, senhaPlana: string) {
  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } })
    
    if (!usuario) return { sucesso: false, erro: "Usuário não encontrado." }
    
    // Validação de senha (MVP)
    if (usuario.senhaHash !== senhaPlana) {
      return { sucesso: false, erro: "Senha incorreta." }
    }

    // --- CRIAÇÃO DA SESSÃO ---
    const dadosSessao = JSON.stringify({
      id: usuario.id,
      nome: usuario.nome,
      perfil: usuario.perfil
    })

    // CORREÇÃO: Adicionamos o 'await' antes de cookies()
    const cookieStore = await cookies()
    
    cookieStore.set('sabor-session', dadosSessao, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 dia
      path: '/'
    })

    return { 
      sucesso: true, 
      usuario: { id: usuario.id, nome: usuario.nome, perfil: usuario.perfil } 
    }
  } catch (e) {
    return { sucesso: false, erro: "Erro no login." }
  }
}

// Função para sair do sistema
export async function realizarLogout() {
  // CORREÇÃO: Adicionamos o 'await' aqui também
  (await cookies()).delete('sabor-session')
  return { sucesso: true }
}