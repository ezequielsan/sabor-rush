'use server'

import { prisma } from '../lib/prisma'

// --- 1. CRIAÇÃO DE PEDIDOS (GARÇOM) ---

type ItemInput = {
  produtoId: string
  quantidade: number
  observacao?: string
  precoUnitario: number
}

// Cria o pedido, baixa o estoque e valida disponibilidade
export async function criarPedido(mesaId: string, itens: ItemInput[]) {
  // Calcula subtotal inicial
  const valorTotal = itens.reduce((acc, item) => acc + (item.precoUnitario * item.quantidade), 0)

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      
      // 1. Verificar e Baixar Estoque
      for (const item of itens) {
        const produto = await tx.produto.findUnique({ where: { id: item.produtoId } })
        
        if (produto?.temEstoqueControlado) {
          if (produto.quantidadeEstoque < item.quantidade) {
            throw new Error(`Estoque insuficiente para: ${produto.nome}`)
          }
          
          await tx.produto.update({
            where: { id: item.produtoId },
            data: { quantidadeEstoque: { decrement: item.quantidade } }
          })
        }
      }

      // 2. Criar o Pedido
      const novoPedido = await tx.pedido.create({
        data: {
          mesaId: mesaId,
          status: 'RECEBIDO',
          subtotal: valorTotal,
          totalFinal: valorTotal, // Inicialmente igual ao subtotal
          itens: {
            create: itens.map(item => ({
              produtoId: item.produtoId,
              quantidade: item.quantidade,
              observacao: item.observacao,
              precoNaHora: item.precoUnitario
            }))
          }
        }
      })
      
      // 3. Atualizar Status da Mesa
      await tx.mesa.update({
        where: { id: mesaId },
        data: { status: 'OCUPADA' }
      })

      return novoPedido
    })
    
    return { sucesso: true, id: resultado.id }

  } catch (erro: any) {
    console.error("Erro ao criar pedido:", erro)
    return { sucesso: false, erro: erro.message || "Falha ao processar pedido" }
  }
}

// --- 2. GESTÃO DA COZINHA (KDS) ---

// Busca pedidos que a cozinha precisa ver (Recebidos ou Em Preparo)
export async function buscarPedidosCozinha() {
  try {
    const pedidos = await prisma.pedido.findMany({
      where: {
        // Traz tudo que NÃO está finalizado, cancelado ou já entregue
        status: { notIn: ['FINALIZADO', 'CANCELADO', 'ENTREGUE'] }
      },
      include: {
        mesa: true,
        itens: {
          include: { produto: true }
        }
      },
      orderBy: { dataCriacao: 'asc' } // FIFO (Primeiro que entra, primeiro que sai)
    })
    return { sucesso: true, dados: pedidos }
  } catch (erro) {
    return { sucesso: false, erro: "Erro ao buscar pedidos da cozinha" }
  }
}

// Atualiza o status (Ex: De 'RECEBIDO' para 'PRONTO')
export async function atualizarStatusPedido(pedidoId: string, novoStatus: 'EM_PREPARO' | 'PRONTO' | 'ENTREGUE') {
  try {
    await prisma.pedido.update({
      where: { id: pedidoId },
      data: { status: novoStatus }
    })
    return { sucesso: true }
  } catch (erro) {
    return { sucesso: false, erro: "Erro ao atualizar status" }
  }
}

// --- 3. FINANCEIRO (TAXAS E CUPONS) ---

// Aplicar Taxa de Serviço ou Desconto Manual
export async function aplicarTaxas(pedidoId: string, taxa: number, desconto: number) {
  try {
    const pedido = await prisma.pedido.findUnique({ where: { id: pedidoId } })
    if (!pedido) return { sucesso: false, erro: 'Pedido não encontrado' }

    const novoTotal = (pedido.subtotal + taxa) - desconto

    await prisma.pedido.update({
      where: { id: pedidoId },
      data: { 
        taxaServico: taxa, 
        desconto: desconto, 
        totalFinal: novoTotal < 0 ? 0 : novoTotal 
      }
    })
    return { sucesso: true }
  } catch (e) {
    return { sucesso: false, erro: "Erro ao aplicar taxas" }
  }
}

// Aplicar Cupom de Desconto
export async function aplicarCupom(pedidoId: string, codigoCupom: string) {
  try {
    const pedido = await prisma.pedido.findUnique({ where: { id: pedidoId } })
    const cupom = await prisma.cupom.findUnique({ where: { codigo: codigoCupom } })

    if (!pedido) return { sucesso: false, erro: "Pedido não encontrado." }
    if (!cupom || !cupom.ativo) return { sucesso: false, erro: "Cupom inválido ou expirado." }

    // Calcular valor do desconto
    let valorDesconto = 0
    if (cupom.descontoFixo) {
      valorDesconto = cupom.descontoFixo
    } else if (cupom.descontoPercentual) {
      valorDesconto = pedido.subtotal * (cupom.descontoPercentual / 100)
    }

    // Aplica e salva
    const novoTotal = (pedido.subtotal + pedido.taxaServico) - valorDesconto
    
    await prisma.pedido.update({
      where: { id: pedidoId },
      data: {
        cupomId: cupom.id,
        desconto: valorDesconto,
        totalFinal: novoTotal < 0 ? 0 : novoTotal
      }
    })
    
    // Contabiliza uso
    await prisma.cupom.update({
      where: { id: cupom.id },
      data: { usos: { increment: 1 } }
    })

    return { sucesso: true, desconto: valorDesconto }
  } catch (e) {
    return { sucesso: false, erro: "Erro ao aplicar cupom." }
  }
}