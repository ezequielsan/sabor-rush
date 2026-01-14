'use client'

import { useState } from 'react'
import { 
  Search, Plus, Edit3, Trash2, Eye, X, CheckCircle, XCircle, Loader2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { criarUsuario, atualizarUsuario, excluirUsuario, alternarStatusUsuario } from '@/actions/usuarios'

interface Usuario {
  id: string
  nome: string
  email: string
  perfil: string
  ativo?: boolean
  criadoEm: Date
  ultimoAcesso?: Date | null
}

interface UsuariosListProps {
  usuariosIniciais: Usuario[]
}

export default function UsuariosList({ usuariosIniciais }: UsuariosListProps) {
  const router = useRouter()
  const usuarios = usuariosIniciais.map(u => ({ ...u, ativo: u.ativo ?? true }))
  
  const [busca, setBusca] = useState('')
  const [loading, setLoading] = useState(false)
  const [modalAberto, setModalAberto] = useState(false)
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null)
  
  const [formData, setFormData] = useState({ 
    nome: '', 
    email: '', 
    perfil: 'GARCOM', 
    senha: '' 
  })

  const filtrados = usuarios.filter(u => 
    u.nome.toLowerCase().includes(busca.toLowerCase()) || 
    u.email.toLowerCase().includes(busca.toLowerCase())
  )

  const kpis = {
    total: usuarios.length,
    ativos: usuarios.filter(u => u.ativo).length,
    inativos: usuarios.filter(u => !u.ativo).length,
    admins: usuarios.filter(u => u.perfil === 'ADMIN').length,
    garcons: usuarios.filter(u => u.perfil === 'GARCOM').length,
    cozinha: usuarios.filter(u => u.perfil === 'COZINHA').length,
    caixa: usuarios.filter(u => u.perfil === 'CAIXA').length,
  }

  const handleAbrirModal = (usuario?: Usuario) => {
    if (usuario) {
      setUsuarioEditando(usuario)
      setFormData({ 
        nome: usuario.nome, 
        email: usuario.email, 
        perfil: usuario.perfil, 
        senha: '' 
      })
    } else {
      setUsuarioEditando(null)
      setFormData({ nome: '', email: '', perfil: 'GARCOM', senha: '' })
    }
    setModalAberto(true)
  }

  const handleSalvar = async () => {
    setLoading(true)
    let res
    
    if (usuarioEditando) {
      res = await atualizarUsuario(usuarioEditando.id, formData)
    } else {
      res = await criarUsuario(
        formData.nome, 
        formData.email, 
        formData.senha, 
        formData.perfil as any
      )
    }

    if (res.sucesso) {
      setModalAberto(false)
      router.refresh()
    } else {
      alert(res.erro)
    }
    setLoading(false)
  }

  const handleExcluir = async (id: string) => {
    if(!confirm("Tem certeza que deseja excluir este usuário?")) return
    await excluirUsuario(id)
  }

  const handleStatus = async (id: string, statusAtual: boolean) => {
    await alternarStatusUsuario(id, statusAtual)
    router.refresh()
  }

  const getPerfilBadge = (perfil: string) => {
    switch(perfil) {
      case 'ADMIN': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'GARCOM': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'COZINHA': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'CAIXA': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="flex flex-col h-full">
      
      {/* HEADER */}
      <div className="flex justify-between items-start mb-6">
        <div>
           <button onClick={() => router.back()} className="px-4 py-2 bg-gray-200 rounded text-gray-700 font-medium mb-2 hover:bg-gray-300 transition text-sm">
             Voltar
           </button>
           <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de usuários</h1>
           <p className="text-gray-500 text-sm">Controle de Acesso e Permissões (ACL)</p>
        </div>
        <div className="text-right hidden md:block">
           <p className="font-bold text-gray-900">Gerente Admin</p>
           <p className="text-xs text-gray-500">Admin</p>
        </div>
      </div>

      {/* CARDS KPI */}
      <div className="flex gap-4 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        <KpiCard label="Total" valor={kpis.total} cor="gray" />
        <KpiCard label="Ativos" valor={kpis.ativos} cor="green" />
        <KpiCard label="Inativos" valor={kpis.inativos} cor="red" />
        <KpiCard label="Admins" valor={kpis.admins} cor="purple" />
        <KpiCard label="Garçons" valor={kpis.garcons} cor="blue" />
        <KpiCard label="Cozinha" valor={kpis.cozinha} cor="orange" />
        <KpiCard label="Caixa" valor={kpis.caixa} cor="green" />
      </div>

      {/* BARRA DE AÇÃO */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-gray-50 p-2 rounded-lg gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou email..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 placeholder-gray-500"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <button 
          onClick={() => handleAbrirModal()}
          className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition shadow-sm"
        >
          <Plus size={20} /> Novo Usuário
        </button>
      </div>

      {/* TABELA */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto shadow-sm flex-1">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="bg-gray-50 text-gray-500 font-bold text-sm uppercase tracking-wider">
             <tr>
               <th className="p-4 border-b">Nome</th>
               <th className="p-4 border-b">E-mail</th>
               <th className="p-4 border-b">Perfil</th>
               <th className="p-4 border-b">Status</th>
               <th className="p-4 border-b">Último Acesso</th>
               <th className="p-4 border-b">Criado em</th>
               <th className="p-4 border-b text-right">Ações</th>
             </tr>
          </thead>
          <tbody className="text-gray-700 text-sm">
            {filtrados.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 border-b last:border-0 transition">
                <td className="p-4 font-medium text-gray-900">{u.nome}</td>
                <td className="p-4 text-gray-600">{u.email}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getPerfilBadge(u.perfil)}`}>
                    {u.perfil}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border w-fit
                    ${u.ativo ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}
                  `}>
                    {u.ativo ? <CheckCircle size={12}/> : <XCircle size={12}/>}
                    {u.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                
                {/* --- CORREÇÃO DE DATA AQUI --- */}
                <td className="p-4 text-gray-500">
                    {u.ultimoAcesso ? new Date(u.ultimoAcesso).toLocaleDateString('pt-BR') : '-'}
                </td>
                
                {/* --- CORREÇÃO DE DATA AQUI --- */}
                <td className="p-4 text-gray-500">
                    {new Date(u.criadoEm).toLocaleDateString('pt-BR')}
                </td>

                <td className="p-4 text-right space-x-2">
                   <button className="text-gray-400 hover:text-gray-600 p-1"><Eye size={18}/></button>
                   <button onClick={() => handleAbrirModal(u)} className="text-blue-400 hover:text-blue-600 p-1"><Edit3 size={18}/></button>
                   <button onClick={() => handleStatus(u.id, !!u.ativo)} className={`p-1 ${u.ativo ? 'text-orange-400 hover:text-orange-600' : 'text-green-400 hover:text-green-600'}`}>
                      {u.ativo ? <XCircle size={18} /> : <CheckCircle size={18} />}
                   </button>
                   <button onClick={() => handleExcluir(u.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">Nenhum usuário encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL --- */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="p-6 border-b flex justify-between items-center">
               <div>
                 <h2 className="text-2xl font-bold text-gray-900">
                   {usuarioEditando ? 'Editar Usuário' : 'Novo Usuário'}
                 </h2>
                 <p className="text-gray-500 text-sm">
                   {usuarioEditando ? 'Atualize as informações' : 'Preencha os dados'}
                 </p>
               </div>
               <button onClick={() => setModalAberto(false)} className="text-gray-400 hover:text-gray-600">
                 <X size={24} />
               </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo *</label>
                <input 
                  type="text" 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 placeholder-gray-500"
                  value={formData.nome}
                  onChange={e => setFormData({...formData, nome: e.target.value})}
                  placeholder="Ex: Fulano da Silva"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">E-mail *</label>
                <input 
                  type="email" 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 placeholder-gray-500"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="Ex: usuario@saborrush.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Perfil de Acesso *</label>
                <div className="relative">
                  <select 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none appearance-none text-gray-900"
                    value={formData.perfil}
                    onChange={e => setFormData({...formData, perfil: e.target.value})}
                  >
                    <option value="ADMIN">Administrador</option>
                    <option value="GARCOM">Garçom/Vendas</option>
                    <option value="COZINHA">Cozinha</option>
                    <option value="CAIXA">Caixa</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                    Senha {usuarioEditando && '(Opcional)'} *
                </label>
                <input 
                  type="password" 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 placeholder-gray-500"
                  value={formData.senha}
                  onChange={e => setFormData({...formData, senha: e.target.value})}
                  placeholder="*******"
                />
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setModalAberto(false)} className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-100">
                Cancelar
              </button>
              <button 
                onClick={handleSalvar}
                disabled={loading}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold shadow-lg transition flex items-center gap-2"
              >
                {loading && <Loader2 className="animate-spin" size={18} />}
                {usuarioEditando ? 'Salvar alterações' : 'Criar Usuário'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

function KpiCard({ label, valor, cor }: { label: string, valor: number, cor: string }) {
  const cores: any = {
    gray: 'border-gray-300 bg-white text-gray-900',
    green: 'border-green-200 bg-green-50 text-green-700',
    red: 'border-red-200 bg-red-50 text-red-700',
    purple: 'border-purple-200 bg-purple-50 text-purple-700',
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    orange: 'border-orange-200 bg-orange-50 text-orange-700',
  }
  const textoCor = cor === 'gray' ? 'text-gray-900' : `text-${cor}-600`
  return (
    <div className={`min-w-[150px] h-28 p-5 rounded-xl border flex flex-col justify-between transition hover:shadow-sm ${cores[cor]}`}>
       <span className={`text-base font-medium ${textoCor}`}>{label}</span>
       <span className={`text-4xl font-normal ${textoCor}`}>{valor}</span>
    </div>
  )
}