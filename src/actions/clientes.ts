'use server'
import { prisma } from '@/lib/prisma'

// [RF01] Cadastrar Novo Cliente
export async function cadastrarCliente(nome: string, telefone: string) {
  try {
    // Verifica duplicidade [RF01 - FA02]
    const existe = await prisma.cliente.findUnique({ where: { telefone } })
    if (existe) return { sucesso: false, erro: "Telefone já cadastrado." }

    const cliente = await prisma.cliente.create({
      data: { nome, telefone }
    })
    return { sucesso: true, dados: cliente }
  } catch (e) {
    return { sucesso: false, erro: "Erro ao cadastrar cliente." }
  }
}

export async function buscarClientePorTelefone(telefone: string) {
  return await prisma.cliente.findUnique({ where: { telefone } })
}

export async function obterHistoricoCliente(clienteId: string) {
  try {
    const pedidos = await prisma.pedido.findMany({
      where: { clienteId, status: 'FINALIZADO' },
      include: { itens: { include: { produto: true } } },
      orderBy: { dataCriacao: 'desc' }
    })
    return { sucesso: true, dados: pedidos }
  } catch (e) {
    return { sucesso: false, erro: "Erro ao buscar histórico." }
  }
}