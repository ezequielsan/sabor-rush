'use server'

import { prisma } from '@/lib/prisma' // <--- Importa do novo local

// --- READ: Buscar Cardápio ---
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

// --- UPDATE: Ajuste de Estoque (RF12) ---
export async function atualizarEstoque(produtoId: string, quantidade: number) {
  try {
    const atualizado = await prisma.produto.update({
      where: { id: produtoId },
      data: { quantidadeEstoque: quantidade }
    })
    return { sucesso: true, dados: atualizado }
  } catch (erro) {
    return { sucesso: false, erro: "Erro ao atualizar estoque" }
  }
}

// [RF02] Criar Novo Produto
export async function salvarProduto(dados: { nome: string, preco: number, categoria: string, estoque?: number }) {
  try {
    await prisma.produto.create({
      data: {
        nome: dados.nome,
        preco: dados.preco,
        categoria: dados.categoria,
        temEstoqueControlado: !!dados.estoque, // Se vier número, ativa controle
        quantidadeEstoque: dados.estoque || 0
      }
    })
    return { sucesso: true }
  } catch (e) {
    return { sucesso: false, erro: "Erro ao salvar produto" }
  }
}

// [RF09] Inativar Produto (Exclusão Lógica)
export async function alternarStatusProduto(id: string, ativo: boolean) {
  try {
    await prisma.produto.update({
      where: { id },
      data: { ativo }
    })
    return { sucesso: true }
  } catch (e) {
    return { sucesso: false, erro: "Erro ao atualizar status" }
  }
}

export { prisma };