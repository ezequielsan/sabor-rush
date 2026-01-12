'use server'

import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function realizarLogin(email: string, senhaPlana: string, perfilSelecionado: string) {
  try {
    if (!perfilSelecionado) {
      return { sucesso: false, erro: "Selecione um perfil de acesso." }
    }

    const usuario = await prisma.usuario.findUnique({ where: { email } })
    
    if (!usuario) return { sucesso: false, erro: "Usuário não encontrado." }
    
    if (usuario.perfil !== perfilSelecionado) {
      return { 
        sucesso: false, 
        erro: `Este usuário não tem permissão de ${perfilSelecionado}.` 
      }
    }

    if (usuario.senhaHash !== senhaPlana) {
      return { sucesso: false, erro: "Senha incorreta." }
    }

    const dadosSessao = JSON.stringify({
      id: usuario.id,
      nome: usuario.nome,
      perfil: usuario.perfil
    })

    const cookieStore = await cookies()
    
    cookieStore.set('sabor-session', dadosSessao, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, 
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