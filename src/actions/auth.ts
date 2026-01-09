'use server'

import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// Agora a função aceita o 3º argumento: perfilSelecionado
export async function realizarLogin(email: string, senhaPlana: string, perfilSelecionado: string) {
  try {
    // 1. Verifica se foi enviado um perfil
    if (!perfilSelecionado) {
      return { sucesso: false, erro: "Selecione um perfil de acesso." }
    }

    const usuario = await prisma.usuario.findUnique({ where: { email } })
    
    if (!usuario) return { sucesso: false, erro: "Usuário não encontrado." }
    
    // 2. [NOVO] Validação de Perfil
    // Verifica se o perfil escolhido no botão bate com o do banco
    if (usuario.perfil !== perfilSelecionado) {
      return { 
        sucesso: false, 
        erro: `Este usuário não tem permissão de ${perfilSelecionado}.` 
      }
    }

    // 3. Validação de senha (MVP)
    if (usuario.senhaHash !== senhaPlana) {
      return { sucesso: false, erro: "Senha incorreta." }
    }

    // --- CRIAÇÃO DA SESSÃO ---
    const dadosSessao = JSON.stringify({
      id: usuario.id,
      nome: usuario.nome,
      perfil: usuario.perfil
    })

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

export async function realizarLogout() {
  (await cookies()).delete('sabor-session')
  return { sucesso: true }
}