'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// --- READ: Buscar Cardápio (Para o Cliente/Garçom) ---
export async function buscarProdutos() {
  try {
    const produtos = await prisma.produto.findMany({
      where: { ativo: true },
      orderBy: { categoria: 'asc' }
    })
    return { sucesso: true, dados: produtos }
  } catch (erro) {
    console.error("Erro ao buscar produtos:", erro)
    return { sucesso: false, erro: "Falha ao carregar cardápio" }
  }
}

// --- NOVO: Listar TUDO para o Admin (Ativos e Inativos) ---
export async function listarTodosProdutos() {
    try {
      const produtos = await prisma.produto.findMany({
        orderBy: { nome: 'asc' }
      })
      return { sucesso: true, dados: produtos }
    } catch (erro) {
      return { sucesso: false, erro: "Erro ao buscar lista de produtos" }
    }
}

// --- READ: Buscar por Categoria ---
export async function buscarPorCategoria(categoria: string) {
  try {
    const produtos = await prisma.produto.findMany({
      where: { 
        ativo: true,
        categoria: categoria
      }
    })
    return { sucesso: true, dados: produtos }
  } catch (erro) {
    return { sucesso: false, erro: "Erro ao filtrar" }
  }
}

// --- UPDATE: Ajuste de Estoque Rápido ---
export async function atualizarEstoque(produtoId: string, quantidade: number) {
  try {
    const atualizado = await prisma.produto.update({
      where: { id: produtoId },
      data: { quantidadeEstoque: quantidade }
    })
    revalidatePath('/dashboard/produtos')
    return { sucesso: true, dados: atualizado }
  } catch (erro) {
    return { sucesso: false, erro: "Erro ao atualizar estoque" }
  }
}

// --- NOVO: Atualizar Produto Completo ---
export async function atualizarProdutoCompleto(id: string, data: any) {
    try {
      await prisma.produto.update({
        where: { id },
        data: {
            nome: data.nome,
            descricao: data.descricao,
            preco: parseFloat(data.preco),
            categoria: data.categoria,
            quantidadeEstoque: parseInt(data.estoque || '0'),
            temEstoqueControlado: true 
        }
      })
      revalidatePath('/dashboard/produtos')
      return { sucesso: true }
    } catch (erro) {
      return { sucesso: false, erro: "Erro ao editar produto" }
    }
}

// --- NOVO: Excluir Definitivamente ---
export async function excluirProduto(id: string) {
    try {
      await prisma.produto.delete({ where: { id } })
      revalidatePath('/dashboard/produtos')
      return { sucesso: true }
    } catch (error) {
      return { sucesso: false, erro: "Erro ao excluir produto" }
    }
}

// [RF02] Criar Novo Produto
export async function salvarProduto(dados: { nome: string, preco: number, categoria: string, estoque?: number, descricao?: string }) {
  try {
    await prisma.produto.create({
      data: {
        nome: dados.nome,
        descricao: dados.descricao,
        preco: dados.preco,
        categoria: dados.categoria,
        temEstoqueControlado: true,
        quantidadeEstoque: dados.estoque || 0,
        ativo: true
      }
    })
    revalidatePath('/dashboard/produtos')
    return { sucesso: true }
  } catch (e) {
    return { sucesso: false, erro: "Erro ao salvar produto" }
  }
}

// [RF09] Inativar Produto
export async function alternarStatusProduto(id: string, ativo: boolean) {
  try {
    await prisma.produto.update({
      where: { id },
      data: { ativo }
    })
    revalidatePath('/dashboard/produtos')
    return { sucesso: true }
  } catch (e) {
    return { sucesso: false, erro: "Erro ao atualizar status" }
  }
}