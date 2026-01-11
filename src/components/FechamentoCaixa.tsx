'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, Printer, Save, CheckCircle, AlertTriangle, 
  Banknote, CreditCard, Smartphone, Loader2, LucideIcon 
} from 'lucide-react'
import { confirmarFechamentoCaixa } from '@/actions/caixa'

// --- PDFMAKE IMPORTS ---
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// Configuração necessária para as fontes do PDF funcionarem no Next.js
// @ts-ignore
if (typeof window !== "undefined" && pdfFonts && pdfFonts.pdfMake) {
    // @ts-ignore
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
} else if (typeof window !== "undefined" && pdfFonts) {
    // @ts-ignore
    pdfMake.vfs = pdfFonts.vfs;
}

// Formatação
const formatarMoeda = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

interface FechamentoProps {
  dadosIniciais: {
    esperado: { [key: string]: number }
    estatisticas: any
  }
}

export default function FechamentoCaixa({ dadosIniciais }: FechamentoProps) {
  const router = useRouter()
  const { esperado, estatisticas } = dadosIniciais
  
  const [loading, setLoading] = useState(false)
  const [observacao, setObservacao] = useState('')
  
  // Estado dos inputs
  const [informado, setInformado] = useState({
    DINHEIRO: '',
    CREDITO: '',
    DEBITO: '',
    PIX: ''
  })

  // Cálculos Derivados
  const totalEsperado = Object.values(esperado).reduce((acc, v) => acc + v, 0)
  
  const totalInformado = Object.values(informado).reduce((acc, v) => {
    return acc + (parseFloat(v.replace(',', '.') || '0'))
  }, 0)

  const divergencia = totalInformado - totalEsperado
  const temDivergencia = Math.abs(divergencia) > 0.05 

  const handleInputChange = (campo: string, valor: string) => {
    setInformado(prev => ({ ...prev, [campo]: valor }))
  }

  // --- FUNÇÃO DE GERAR PDF ---
  const handleImprimirRelatorio = () => {
    const dataHora = new Date().toLocaleString('pt-BR');
    
    // Prepara os dados da tabela
    const metodos = [
        { key: 'DINHEIRO', label: 'Dinheiro' },
        { key: 'CREDITO', label: 'Crédito' },
        { key: 'DEBITO', label: 'Débito' },
        { key: 'PIX', label: 'Pix' },
    ];

    const linhasTabela = metodos.map(m => {
        // @ts-ignore
        const valorEsp = esperado[m.key] || 0;
        // @ts-ignore
        const valorInf = parseFloat(informado[m.key]?.replace(',', '.') || '0');
        const diff = valorInf - valorEsp;
        
        return [
            m.label,
            { text: formatarMoeda(valorEsp), alignment: 'right' },
            { text: formatarMoeda(valorInf), alignment: 'right' },
            { 
                text: formatarMoeda(diff), 
                alignment: 'right', 
                color: diff < -0.01 ? 'red' : diff > 0.01 ? 'blue' : 'gray',
                bold: Math.abs(diff) > 0.01
            }
        ];
    });

    // Definição do Documento
    const docDefinition: any = {
        content: [
            { text: 'SaborRush - Fechamento de Caixa', style: 'header' },
            { text: `Gerado em: ${dataHora}`, style: 'subheader' },
            { text: `Responsável: Admin`, style: 'subheader', margin: [0, 0, 0, 20] },

            // Resumo KPI
            {
                table: {
                    widths: ['*', '*', '*'],
                    body: [
                        [
                            { text: 'Valor Esperado', style: 'tableHeader', fillColor: '#ebf8ff' },
                            { text: 'Valor Informado', style: 'tableHeader', fillColor: '#f0fff4' },
                            { text: 'Divergência', style: 'tableHeader', fillColor: temDivergencia ? '#fff5f5' : '#f7fafc' }
                        ],
                        [
                            { text: formatarMoeda(totalEsperado), style: 'kpiValue', alignment: 'center' },
                            { text: formatarMoeda(totalInformado), style: 'kpiValue', alignment: 'center' },
                            { 
                                text: formatarMoeda(divergencia), 
                                style: 'kpiValue', 
                                alignment: 'center',
                                color: divergencia < 0 ? 'red' : divergencia > 0 ? 'blue' : 'gray' 
                            }
                        ]
                    ]
                },
                layout: 'noBorders',
                margin: [0, 0, 0, 20]
            },

            { text: 'Detalhamento por Método', style: 'sectionTitle' },
            {
                table: {
                    headerRows: 1,
                    widths: ['*', 'auto', 'auto', 'auto'],
                    body: [
                        [
                            { text: 'Método', style: 'tableHeader' }, 
                            { text: 'Esperado', style: 'tableHeader' }, 
                            { text: 'Informado', style: 'tableHeader' }, 
                            { text: 'Diferença', style: 'tableHeader' }
                        ],
                        ...linhasTabela
                    ]
                },
                layout: 'lightHorizontalLines',
                margin: [0, 0, 0, 20]
            },

            { text: 'Estatísticas do Turno', style: 'sectionTitle' },
            {
                columns: [
                    {
                        width: 'auto',
                        text: [
                            { text: 'Vendas Realizadas: ', bold: true }, estatisticas.vendasRealizadas, '\n',
                            { text: 'Ticket Médio: ', bold: true }, formatarMoeda(estatisticas.ticketMedio), '\n',
                        ]
                    },
                    {
                        width: 'auto',
                        text: [
                            { text: 'Total Líquido: ', bold: true }, formatarMoeda(estatisticas.totalLiquido), '\n',
                            { text: 'Descontos: ', bold: true }, formatarMoeda(estatisticas.totalDescontos), '\n',
                        ]
                    }
                ],
                columnGap: 40,
                margin: [0, 0, 0, 20]
            },

            observacao ? [
                { text: 'Observações / Justificativas:', style: 'sectionTitle' },
                { text: observacao, style: 'obsBox' }
            ] : [],

            { text: '\n\n\n\n__________________________________________', alignment: 'center' },
            { text: 'Assinatura do Responsável', alignment: 'center', fontSize: 10 }
        ],
        styles: {
            header: { fontSize: 18, bold: true, margin: [0, 0, 0, 5] },
            subheader: { fontSize: 10, color: 'gray', margin: [0, 0, 0, 5] },
            sectionTitle: { fontSize: 14, bold: true, margin: [0, 10, 0, 10] },
            tableHeader: { bold: true, fontSize: 11, color: 'black', margin: [0, 5, 0, 5] },
            kpiValue: { fontSize: 14, bold: true, margin: [0, 10, 0, 10] },
            obsBox: { fontSize: 10, italics: true, background: '#f7fafc', margin: [0, 5, 0, 20] }
        }
    };

    pdfMake.createPdf(docDefinition).open();
  }

  const handleFecharCaixa = async () => {
    if (temDivergencia && !observacao) {
      alert("Por favor, justifique a divergência no campo de observações.")
      return
    }

    if (!confirm("Tem certeza que deseja fechar o caixa? Essa ação é irreversível.")) return

    setLoading(true)
    
    // --- CORREÇÃO AQUI ---
    // Removemos 'divergencia' e 'estatisticas' pois o backend não precisa deles
    const res = await confirmarFechamentoCaixa({
      esperado,
      informado,
      observacao
    })
    // ---------------------

    if (res.sucesso) {
      alert("Caixa fechado com sucesso!")
      router.push('/dashboard')
    } else {
      alert("Erro ao fechar caixa.")
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-full bg-gray-50/50 p-2 md:p-6 overflow-y-auto">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 text-sm flex items-center gap-2">
            <ArrowLeft size={16} /> Voltar
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fechamento de caixa</h1>
            <p className="text-xs text-gray-500">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="text-right hidden md:block">
           <p className="font-bold text-gray-900">Admin</p>
           <p className="text-xs text-gray-500">{new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</p>
        </div>
      </div>

      {/* CARDS KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl">
           <p className="text-blue-600 font-medium text-sm mb-1">Valor Esperado (Sistema)</p>
           <p className="text-3xl font-bold text-blue-900">{formatarMoeda(totalEsperado)}</p>
        </div>
        <div className={`border p-6 rounded-xl transition-colors ${temDivergencia ? 'bg-white border-gray-200' : 'bg-green-50 border-green-200'}`}>
           <p className="text-gray-500 font-medium text-sm mb-1">Valor Informado</p>
           <p className={`text-3xl font-bold ${temDivergencia ? 'text-gray-900' : 'text-green-700'}`}>
             {formatarMoeda(totalInformado)}
           </p>
        </div>
        <div className={`p-6 rounded-xl border ${divergencia < 0 ? 'bg-red-50 border-red-200' : divergencia > 0 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
           <p className={`${divergencia < 0 ? 'text-red-600' : divergencia > 0 ? 'text-blue-600' : 'text-gray-500'} font-medium text-sm mb-1`}>
             Divergências
           </p>
           <p className={`text-3xl font-bold ${divergencia < 0 ? 'text-red-700' : divergencia > 0 ? 'text-blue-700' : 'text-gray-400'}`}>
             {formatarMoeda(divergencia)}
             {divergencia < 0 && <span className="text-xs font-normal ml-2 text-red-500">(Falta)</span>}
             {divergencia > 0 && <span className="text-xs font-normal ml-2 text-blue-500">(Sobra)</span>}
           </p>
        </div>
      </div>

      {/* LISTA DE CONFERÊNCIA */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-8 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Conferência por Forma de Pagamento</h2>
        <p className="text-gray-500 text-sm mb-8">Informe os valores recebidos em cada forma de pagamento (Contagem Cega).</p>

        <div className="space-y-8">
          <InputLinha 
            label="Dinheiro" 
            icon={Banknote} 
            esperado={esperado.DINHEIRO} 
            valor={informado.DINHEIRO} 
            onChange={(v) => handleInputChange('DINHEIRO', v)} 
          />
          <hr className="border-gray-100" />
          
          <InputLinha 
            label="Cartão de Crédito" 
            icon={CreditCard} 
            esperado={esperado.CREDITO} 
            valor={informado.CREDITO} 
            onChange={(v) => handleInputChange('CREDITO', v)} 
          />
          <hr className="border-gray-100" />

          <InputLinha 
            label="Cartão de Débito" 
            icon={CreditCard} 
            esperado={esperado.DEBITO} 
            valor={informado.DEBITO} 
            onChange={(v) => handleInputChange('DEBITO', v)} 
          />
          <hr className="border-gray-100" />

          <InputLinha 
            label="PIX" 
            icon={Smartphone} 
            esperado={esperado.PIX} 
            valor={informado.PIX} 
            onChange={(v) => handleInputChange('PIX', v)} 
          />
        </div>
      </div>

      {/* OBSERVAÇÕES E ALERTAS */}
      <div className="mb-8">
        <h3 className="font-bold text-gray-900 mb-2">Observações</h3>
        <textarea 
          className="w-full border border-gray-300 rounded-xl p-4 text-sm focus:ring-2 focus:ring-orange-500 outline-none h-32 resize-none text-gray-900"
          placeholder="Adicione uma observação sobre quebras de caixa, sangrias ou justificativas..."
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
        />
      </div>

      {temDivergencia && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800 animate-in slide-in-from-bottom-2">
           <AlertTriangle className="shrink-0 mt-0.5" />
           <div>
             <p className="font-bold">Há uma divergência de {formatarMoeda(divergencia)} no caixa.</p>
             <p className="text-sm">O valor informado é {divergencia < 0 ? 'menor' : 'maior'} que o esperado. Verifique os comprovantes.</p>
           </div>
        </div>
      )}

      {/* BOTÕES DE AÇÃO */}
      <div className="flex flex-col md:flex-row gap-4 mb-10 justify-end">
        
        {/* BOTÃO IMPRIMIR AGORA GERA O PDF */}
        <button 
          onClick={handleImprimirRelatorio}
          className="px-6 py-3 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
        >
          <Printer size={20} /> Imprimir Relatório
        </button>

        {/* <button className="px-6 py-3 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2">
          <Save size={20} /> Salvar Rascunho
        </button> */}
        <button 
          onClick={handleFecharCaixa}
          disabled={loading}
          className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-lg shadow-orange-200 flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading ? <Loader2 className="animate-spin" /> : <CheckCircle size={20} />}
          Confirmar Fechamento
        </button>
      </div>

      {/* RODAPÉ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
           <h4 className="font-bold text-gray-900 mb-6 text-lg">Resumo do Turno</h4>
           <div className="space-y-4 text-sm">
             <div className="flex justify-between text-gray-600">
               <span>Vendas Realizadas:</span>
               <span className="font-bold text-gray-900">{estatisticas.vendasRealizadas}</span>
             </div>
             <div className="flex justify-between text-gray-600">
               <span>Ticket Médio:</span>
               <span className="font-bold text-gray-900">{formatarMoeda(estatisticas.ticketMedio)}</span>
             </div>
             <div className="flex justify-between text-gray-600">
               <span>Horário de Abertura:</span>
               <span className="font-bold text-gray-900">08:00</span>
             </div>
           </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
           <h4 className="font-bold text-gray-900 mb-6 text-lg">Movimentação do Dia</h4>
           <div className="space-y-4 text-sm">
             <div className="flex justify-between text-gray-600">
               <span>Vendas Brutas:</span>
               <span className="font-bold text-gray-900">{formatarMoeda(estatisticas.totalLiquido)}</span>
             </div>
             <div className="flex justify-between text-gray-600">
               <span>Descontos Aplicados:</span>
               <span className="font-bold text-red-600">- {formatarMoeda(estatisticas.totalDescontos)}</span>
             </div>
             <div className="border-t pt-4 flex justify-between items-center mt-2">
               <span className="font-bold text-gray-900 text-base">Total Líquido:</span>
               <span className="font-bold text-gray-900 text-lg">{formatarMoeda(estatisticas.totalLiquido - estatisticas.totalDescontos)}</span>
             </div>
           </div>
        </div>
      </div>

    </div>
  )
}

interface InputLinhaProps {
  label: string
  icon: LucideIcon
  esperado: number
  valor: string
  onChange: (valor: string) => void
}

function InputLinha({ label, icon: Icon, esperado, valor, onChange }: InputLinhaProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
      <div className="md:col-span-4 flex items-center gap-4">
        <Icon size={24} className="text-gray-900" />
        <span className="font-bold text-gray-900 text-lg">{label}</span>
      </div>

      <div className="md:col-span-4">
        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Valor Esperado</label>
        <div className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 font-medium">
          {formatarMoeda(esperado)}
        </div>
      </div>

      <div className="md:col-span-4">
        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Valor Recebido</label>
        <input 
          type="number" 
          step="0.01"
          className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 font-bold focus:ring-2 focus:ring-orange-500 outline-none"
          placeholder="R$ 0,00"
          value={valor}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  )
}