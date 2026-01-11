'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Eye, Edit, RefreshCcw, Trash2 } from 'lucide-react'

type Usuario = {
    nome: string
    email: string
    perfil: string
    perfilCor: string
    status: string
    statusCor: string
    ultimoAcesso: string
    criadoEm: string
}

function StatusCard({
    label,
    count,
    colorClass,
}: {
    label: string
    count: number
    colorClass?: string
}) {
    return (
        <div
            className={`w-full h-[216px] border rounded-lg px-6 py-4 flex flex-col items-center justify-center
        ${colorClass ? colorClass : 'bg-white border-gray-300 text-gray-900'}
      `}
        >
            <p className={`text-sm font-semibold mb-1 ${colorClass ? 'opacity-80' : ''}`}>
                {label}
            </p>
            <p className="text-xl font-bold">{count}</p>
        </div>
    )
}

// Dados mock
const usuariosMock = [
    {
        nome: 'Admin Sistema',
        email: 'admin@saborrush.com',
        perfil: 'Administrador',
        perfilCor: 'bg-purple-200 text-purple-800',
        status: 'Ativo',
        statusCor: 'bg-green-100 text-green-700',
        ultimoAcesso: '18/11/2025',
        criadoEm: '14/11/2024',
    },
    {
        nome: 'João Silva',
        email: 'garcom@saborrush.com',
        perfil: 'Garçom/Vendas',
        perfilCor: 'bg-blue-200 text-blue-800',
        status: 'Ativo',
        statusCor: 'bg-green-100 text-green-700',
        ultimoAcesso: '18/11/2025',
        criadoEm: '19/11/2024',
    },
    {
        nome: 'Maria Santos',
        email: 'cozinha@saborrush.com',
        perfil: 'Cozinha',
        perfilCor: 'bg-orange-200 text-orange-800',
        status: 'Ativo',
        statusCor: 'bg-green-100 text-green-700',
        ultimoAcesso: '18/11/2025',
        criadoEm: '21/11/2024',
    },
    {
        nome: 'Pedro Costa',
        email: 'caixa@saborrush.com',
        perfil: 'Caixa',
        perfilCor: 'bg-green-200 text-green-800',
        status: 'Ativo',
        statusCor: 'bg-green-100 text-green-700',
        ultimoAcesso: '18/11/2025',
        criadoEm: '29/11/2024',
    },
    {
        nome: 'Ana Oliveira',
        email: 'ana.garcom@saborrush.com',
        perfil: 'Garçom/Vendas',
        perfilCor: 'bg-blue-200 text-blue-800',
        status: 'Inativo',
        statusCor: 'bg-red-100 text-red-700',
        ultimoAcesso: '14/10/2024',
        criadoEm: '09/11/2024',
    },
]

export default function GerenciaUsuariosPage() {
    const router = useRouter()
    const [busca, setBusca] = useState('')
    const [modalAberto, setModalAberto] = useState(false)
    const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null)


    const usuariosFiltrados = usuariosMock.filter(
        (user) =>
            user.nome.toLowerCase().includes(busca.toLowerCase()) ||
            user.email.toLowerCase().includes(busca.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-gray-100">
            
            {/* HEADER */}
            <header className="bg-white border-b px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="px-3 py-1 border rounded text-sm text-gray-700 hover:bg-gray-50"
                        >
                            Voltar
                        </button>

                        <div>
                            <h1 className="text-lg font-semibold text-gray-700">
                                Gerenciamento de usuários
                            </h1>
                            <p className="text-xs text-gray-500">
                                Controle de Acesso e Permissões (ACL)
                            </p>
                        </div>
                    </div>

                    <div className="text-right">
                        <p className="text-sm font-medium">Fulano de Tal</p>
                        <p className="text-xs text-gray-500">Admin</p>
                    </div>
                </div>
            </header>

            {/* CARDS */}
            <section className="px-6 py-6 grid grid-cols-7 gap-4">
                <StatusCard label="Total" count={5} />
                <StatusCard label="Ativos" count={4} colorClass="bg-green-100 text-green-700 border-green-300" />
                <StatusCard label="Inativos" count={1} colorClass="bg-red-100 text-red-700 border-red-300" />
                <StatusCard label="Admins" count={1} colorClass="bg-purple-100 text-purple-700 border-purple-300" />
                <StatusCard label="Garçons" count={2} colorClass="bg-blue-100 text-blue-700 border-blue-300" />
                <StatusCard label="Cozinha" count={1} colorClass="bg-orange-100 text-orange-700 border-orange-300" />
                <StatusCard label="Caixa" count={1} colorClass="bg-green-100 text-green-700 border-green-300" />
            </section>

            {/* LISTA */}
            <section className="px-6 pb-6">
                <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                    <input
                        type="text"
                        placeholder="Buscar por nome ou email..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="flex-grow min-w-[250px] max-w-sm border rounded-md px-3 py-2 text-sm"
                    />
                    <button
                        onClick={() => {
                            setUsuarioSelecionado(null)
                            setModalAberto(true)
                        }}
                        className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600"
                    >
                        + Novo Usuário
                    </button>


                </div>

                <div className="overflow-y-auto max-h-[400px] border rounded-md bg-white">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                {['Nome', 'E-mail', 'Perfil', 'Status', 'Último Acesso', 'Criado em', 'Ações'].map(
                                    (h) => (
                                        <th
                                            key={h}
                                            className="py-3 px-4 border-b border-gray-200 font-semibold text-gray-700"
                                        >
                                            {h}
                                        </th>
                                    )
                                )}
                            </tr>
                        </thead>

                        <tbody>
                            {usuariosFiltrados.map((user, idx) => (
                                <tr key={idx} className="even:bg-gray-50">
                                    <td className="py-3 px-4 text-gray-500 border-b">{user.nome}</td>
                                    <td className="py-3 px-4 text-gray-500 border-b w-[20%] max-w-[220px] truncate">
                                        {user.email}
                                    </td>


                                    {/* PERFIL */}
                                    <td className="py-3 px-4 text-gray-500 border-b text-left">
                                        <div
                                            className={`inline-block  px-3 py-1 text-gray-500 rounded-md text-xs font-medium ${user.perfilCor}`}
                                        >
                                            {user.perfil}
                                        </div>
                                    </td>

                                    {/* STATUS */}
                                    <td className="py-3 px-4 text-gray-500 border-b text-left">
                                        <div
                                            className={`inline-flex items-center gap-1 px-3 py-1  rounded-md text-xs font-medium ${user.statusCor}`}
                                        >
                                            {user.status === 'Ativo' ? '✓' : '✕'}
                                            <span>{user.status}</span>
                                        </div>
                                    </td>

                                    <td className="py-3 px-4 text-gray-500 border-b">{user.ultimoAcesso}</td>
                                    <td className="py-3 px-4 text-gray-500 border-b">{user.criadoEm}</td>

                                    {/* AÇÕES */}
                                    <td className="py-3 px-4 text-gray-500 border-b">
                                        <div className="flex items-center text-gray-500 gap-2 text-gray-600">
                                            <button
                                                title="Visualizar"
                                                onClick={() => {
                                                    setUsuarioSelecionado(user)
                                                    setModalAberto(true)
                                                }}
                                                className="hover:text-gray-900"
                                            >
                                                <Edit size={16} />
                                            </button>                                           
                                            <button className="text-red-600"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {modalAberto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Overlay */}
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setModalAberto(false)}
                    />

                    {/* Modal */}
                    <div className="relative bg-white w-full max-w-lg rounded-xl shadow-lg p-6 z-10">

                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800">
                                    {usuarioSelecionado ? 'Visualizar Usuário' : 'Novo Usuário'}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Preencha os dados para criar um novo usuário
                                </p>
                            </div>
                            <button
                                onClick={() => setModalAberto(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Form */}
                        <form className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-500 font-medium">Nome Completo *</label>
                                <input
                                    type="text"
                                    defaultValue={usuarioSelecionado?.nome || ''}
                                    className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-500 font-medium">E-mail *</label>
                                <input
                                    type="email"
                                    defaultValue={usuarioSelecionado?.email || ''}
                                    className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-500 font-medium">Perfil de Acesso *</label>
                                <select
                                    defaultValue={usuarioSelecionado?.perfil || ''}
                                    className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                                >
                                    <option value="">Selecione</option>
                                    <option value="Administrador">Administrador</option>
                                    <option value="Garçom/Vendas">Garçom/Vendas</option>
                                    <option value="Cozinha">Cozinha</option>
                                    <option value="Caixa">Caixa</option>
                                </select>
                            </div>

                            {!usuarioSelecionado && (
                                <div>
                                    <label className="text-sm font-medium">Senha *</label>
                                    <input
                                        type="password"
                                        className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                                        placeholder="******"
                                    />
                                </div>
                            )}

                            <div className="text-xs text-gray-500 border rounded-md px-3 py-2">
                                O usuário receberá um e-mail com instruções de acesso.
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setModalAberto(false)}
                                    className="px-4 py-2 text-sm border rounded-md"
                                >
                                    Fechar
                                </button>

                                {!usuarioSelecionado && (
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm bg-purple-500 text-white rounded-md"
                                    >
                                        Criar Usuário
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}


        </div>
    )
}
