import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import TransferirMesaForm from '@/components/TransferirMesaForm'

interface TransferirPageProps {
  params: Promise<{ id: string }>
}

export default async function TransferirPage({ params }: TransferirPageProps) {
  const { id } = await params

  // 1. Busca mesa de Origem
  const mesaOrigem = await prisma.mesa.findUnique({
    where: { id }
  })

  // Se a mesa não existe ou está livre, não faz sentido transferir
  if (!mesaOrigem || mesaOrigem.status === 'LIVRE') {
    redirect('/dashboard')
  }

  // 2. Busca TODAS as mesas que estão LIVRES (Candidatas a destino)
  const mesasLivresDb = await prisma.mesa.findMany({
    where: { status: 'LIVRE' },
    orderBy: { numero: 'asc' }
  })

  // --- CORREÇÃO DO ERRO ---
  // O componente espera a propriedade 'nome', mas o banco só tem 'numero'.
  // Vamos criar objetos formatados adicionando o nome manualmente.

  const mesaOrigemFormatada = {
    id: mesaOrigem.id,
    numero: mesaOrigem.numero,
    nome: `Mesa ${mesaOrigem.numero}` // <--- ADICIONAMOS O NOME AQUI
  }

  const mesasLivresFormatadas = mesasLivresDb.map(m => ({
    ...m,
    nome: `Mesa ${m.numero}` // <--- E AQUI TAMBÉM
  }))

  return (
    <TransferirMesaForm 
      mesaOrigem={mesaOrigemFormatada} 
      mesasLivres={mesasLivresFormatadas} 
    />
  )
}