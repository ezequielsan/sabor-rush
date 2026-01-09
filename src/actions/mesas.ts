'use server'

import { prisma } from '@/lib/prisma'

// --- READ: Listar Status das Mesas ---
export async function listarMesas() {
  try {
    const mesas = await prisma.mesa.findMany({
      orderBy: { numero: 'asc' },
      include: {
        // Inclui pedidos que não estão finalizados/cancelados para mostrar o total da mesa
        pedidos: {
          where: {
            status: { notIn: ['CANCELADO', 'FINALIZADO'] }
          },
          select: { totalFinal: true, subtotal: true } // Ajustado para pegar totalFinal ou subtotal
        }
      }
    })

    // Formata o retorno para somar o total da mesa se houver pedidos abertos
    const mesasFormatadas = mesas.map(mesa => ({
      ...mesa,
      // Se tiver totalFinal usa ele, senão usa subtotal
      totalConta: mesa.pedidos.reduce((acc, p) => acc + (p.totalFinal || p.subtotal || 0), 0)
    }))

    return { sucesso: true, dados: mesasFormatadas }
  } catch (erro) {
    return { sucesso: false, erro: "Erro ao listar mesas" }
  }
}

// --- UPDATE: Abrir Mesa (Ocupar) ---
export async function ocuparMesa(mesaId: string) {
  try {
    await prisma.mesa.update({
      where: { id: mesaId },
      data: { status: 'OCUPADA' }
    })
    return { sucesso: true }
  } catch (erro) {
    return { sucesso: false, erro: "Erro ao ocupar mesa" }
  }
}

// --- UPDATE: Liberar Mesa (Após pagamento) ---
export async function liberarMesa(mesaId: string) {
  try {
    await prisma.mesa.update({
      where: { id: mesaId },
      data: { status: 'LIVRE' }
    })
    return { sucesso: true }
  } catch (erro) {
    return { sucesso: false, erro: "Erro ao liberar mesa" }
  }
}

// --- UPDATE: Transferir Mesa (RF14) ---
export async function transferirMesa(idOrigem: string, idDestino: string) {
  try {
    await prisma.$transaction(async (tx) => {
      // Pega os pedidos da origem que não foram pagos
      const pedidosOrigem = await tx.pedido.findMany({
        where: { mesaId: idOrigem, status: { not: 'FINALIZADO' } }
      })

      if (pedidosOrigem.length === 0) throw new Error("Mesa origem vazia")

      // Move todos os pedidos para a mesa destino
      await tx.pedido.updateMany({
        where: { mesaId: idOrigem, status: { not: 'FINALIZADO' } },
        data: { mesaId: idDestino }
      })

      // Libera mesa origem
      await tx.mesa.update({ where: { id: idOrigem }, data: { status: 'LIVRE' } })
      
      // Garante que destino está ocupada
      await tx.mesa.update({ where: { id: idDestino }, data: { status: 'OCUPADA' } })
    })
    return { sucesso: true }
  } catch (e: any) {
    return { sucesso: false, erro: e.message }
  }
}

// --- UPDATE: Unir Mesas (RF14) ---
export async function unirMesas(idMesaOrigem: string, idMesaDestino: string) {
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Validar se ambas estão ocupadas
      const origem = await tx.mesa.findUnique({ where: { id: idMesaOrigem } })
      const destino = await tx.mesa.findUnique({ where: { id: idMesaDestino } })

      if (origem?.status !== 'OCUPADA' || destino?.status !== 'OCUPADA') {
        throw new Error("Ambas as mesas devem estar ocupadas para unir.")
      }

      // 2. Mover pedidos da origem para o destino
      await tx.pedido.updateMany({
        where: { mesaId: idMesaOrigem, status: { not: 'FINALIZADO' } },
        data: { mesaId: idMesaDestino }
      })

      // 3. Liberar mesa origem
      await tx.mesa.update({
        where: { id: idMesaOrigem },
        data: { status: 'LIVRE' }
      })
    })
    return { sucesso: true }
  } catch (e: any) {
    return { sucesso: false, erro: e.message }
  }
}

// ... (mantenha os imports e funções anteriores)

export async function buscarDadosDashboard() {
  try {
    // Busca mesas e inclui os pedidos que NÃO estão finalizados
    const mesas = await prisma.mesa.findMany({
      orderBy: { numero: 'asc' }, 
      include: {
        pedidos: {
          where: {
            status: { not: 'FINALIZADO' }
          },
          include: {
            itens: true
          }
        }
      }
    })

    // Processa os dados
    const mesasFormatadas = mesas.map((mesa: any) => {
      const pedidoAtual = mesa.pedidos[0]
      
      let total = 0
      let itensCount = 0
      let tempo = 'Livre'

      if (pedidoAtual) {
        total = pedidoAtual.totalFinal
        itensCount = pedidoAtual.itens.length
        
        const diffMs = new Date().getTime() - new Date(pedidoAtual.dataCriacao).getTime()
        const diffMins = Math.floor(diffMs / 60000)
        
        if (diffMins > 60) {
            const horas = Math.floor(diffMins / 60)
            const minutos = diffMins % 60
            tempo = `${horas}h ${minutos}min`
        } else {
            tempo = `${diffMins}min`
        }
      }

      return {
        id: mesa.id,
        codigo: mesa.numero, 
        status: mesa.status,
        nome: `Mesa ${mesa.numero}`, 
        total,
        itensCount,
        tempo
      }
    })

    // Cálculos dos Cards
    const totalMesas = mesas.length
    const ocupadas = mesas.filter(m => m.status === 'OCUPADA').length
    const livres = mesas.filter(m => m.status === 'LIVRE').length
    
    // Soma o total
    const faturamentoAberto = mesasFormatadas.reduce((acc: number, curr: any) => acc + curr.total, 0)

    return {
      sucesso: true,
      dados: {
        mesas: mesasFormatadas,
        resumo: {
          totalMesas,
          ocupadas,
          livres,
          faturamentoAberto
        }
      }
    }

  } catch (error) {
    console.error(error)
    return { sucesso: false, erro: "Erro ao carregar dashboard" }
  }
}