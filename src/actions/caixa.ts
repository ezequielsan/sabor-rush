'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

// --- BUSCAR DADOS DO CAIXA (COM LÓGICA DE TURNOS) ---
export async function obterDadosFechamento() {
  try {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0) // Início do dia (00:00)
    
    const amanha = new Date(hoje)
    amanha.setDate(amanha.getDate() + 1) // Fim do dia

    // 1. Verifica se já houve algum fechamento HOJE
    const ultimoFechamento = await prisma.fechamentoCaixa.findFirst({
      where: {
        dataFechamento: {
          gte: hoje,
          lt: amanha
        }
      },
      orderBy: {
        dataFechamento: 'desc' // Pega o mais recente
      }
    })

    // 2. Define o ponto de partida (Início do Turno)
    // Se teve fechamento, começamos a contar a partir dele. Se não, desde as 00:00.
    const inicioTurno = ultimoFechamento ? ultimoFechamento.dataFechamento : hoje

    // 3. Busca apenas os pedidos deste turno atual
    const pedidos = await prisma.pedido.findMany({
      where: {
        status: 'FINALIZADO',
        dataCriacao: {
          gte: inicioTurno, // <--- O PULO DO GATO ESTÁ AQUI
          lt: amanha
        }
      }
    })

    const totalVendas = pedidos.reduce((acc, p) => acc + Number(p.totalFinal), 0)
    
    // MOCK: Distribuição simulada (Ajuste conforme sua necessidade)
    const esperado = {
      DINHEIRO: totalVendas * 0.2,
      CREDITO: totalVendas * 0.4, 
      DEBITO: totalVendas * 0.3,   
      PIX: totalVendas * 0.1       
    }

    const estatisticas = {
      vendasRealizadas: pedidos.length,
      ticketMedio: pedidos.length > 0 ? totalVendas / pedidos.length : 0,
      totalLiquido: totalVendas, 
      totalDescontos: 0,
      inicioTurno: inicioTurno // Opcional: útil se quiser mostrar na tela "Aberto às X horas"
    }

    return { 
      sucesso: true, 
      dados: { esperado, estatisticas } 
    }

  } catch (error) {
    console.error(error)
    return { sucesso: false, erro: "Erro ao calcular fechamento" }
  }
}

// --- SALVAR FECHAMENTO ---
export async function confirmarFechamentoCaixa(payload: { 
  esperado: any, 
  informado: any, 
  observacao: string 
}) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('sabor-session')?.value
    
    if (!sessionCookie) return { sucesso: false, erro: "Usuário não autenticado." }

    const usuarioLogado = JSON.parse(sessionCookie)
    const usuarioId = usuarioLogado.id 

    if (!usuarioId) return { sucesso: false, erro: "ID do usuário não encontrado." }

    // Recalcula totais para segurança
    const totalEsperado = Object.values(payload.esperado).reduce((acc: number, val: any) => acc + Number(val), 0)

    const totalReal = Object.values(payload.informado).reduce((acc: number, val: any) => {
      if (typeof val === 'string') {
        const limpo = val.replace(/\./g, '').replace(',', '.')
        return acc + (parseFloat(limpo) || 0)
      }
      return acc + (Number(val) || 0)
    }, 0)

    const diferenca = totalReal - totalEsperado

    // Salva no banco
    await prisma.fechamentoCaixa.create({
      data: {
        valorTotalEsperado: totalEsperado,
        valorTotalReal: totalReal,
        diferenca: diferenca,
        justificativa: payload.observacao || null,
        usuarioId: usuarioId
      }
    })
    
    // Atualiza a cache para que a próxima consulta já venha zerada
    revalidatePath('/dashboard/caixa/fechamento')

    return { sucesso: true }
  } catch (error) {
    console.error("Erro ao salvar fechamento:", error)
    return { sucesso: false, erro: "Erro ao salvar fechamento no banco." }
  }
}