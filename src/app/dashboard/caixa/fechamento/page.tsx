import { obterDadosFechamento } from '@/actions/caixa'
import FechamentoCaixa from '@/components/FechamentoCaixa'

export default async function FechamentoPage() {
  const { dados } = await obterDadosFechamento()
  
  // Dados de fallback caso dê erro
  const dadosIniciais = dados || {
    esperado: { DINHEIRO: 0, CREDITO: 0, DEBITO: 0, PIX: 0 },
    estatisticas: { vendasRealizadas: 0, ticketMedio: 0, totalLiquido: 0, totalDescontos: 0 }
  }

  return (
    <div className="h-full">
      <FechamentoCaixa dadosIniciais={dadosIniciais} />
    </div>
  )
}