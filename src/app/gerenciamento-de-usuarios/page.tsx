'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Eye, Edit, RefreshCcw, Trash2 } from 'lucide-react'

function StatusCard({ label, count, colorClass }: { label: string, count: number, colorClass?: string }) {
    return (
        <div
            className={`w-full h-[216px] border rounded-lg px-6 py-4 flex flex-col items-center justify-center
        ${colorClass ? colorClass : 'bg-white border-gray-300 text-gray-900'}
      `}
        >
            <p className={`text-sm font-semibold mb-1 ${colorClass ? 'opacity-80' : ''}`}>
                {label}
            </p>
            <p className={`text-xl font-bold`}>
                {count}
            </p>
        </div>
    )
}

// Dados fixos de exemplo (podem vir de API)
const usuariosMock = [
    {
        nome: "Admin Sistema",
        email: "admin@saborrush.com",
        perfil: "Administrador",
        perfilCor: "bg-purple-200 text-purple-800",
        status: "Ativo",
        statusCor: "bg-green-100 text-green-700",
        ultimoAcesso: "18/11/2025",
        criadoEm: "14/11/2024"
    },
    {
        nome: "João Silva",
        email: "garcom@saborrush.com",
        perfil: "Garçom/Vendas",
        perfilCor: "bg-blue-200 text-blue-800",
        status: "Ativo",
        statusCor: "bg-green-100 text-green-700",
        ultimoAcesso: "18/11/2025",
        criadoEm: "19/11/2024"
    },
    {
        nome: "Maria Santos",
        email: "cozinha@saborrush.com",
        perfil: "Cozinha",
        perfilCor: "bg-orange-200 text-orange-800",
        status: "Ativo",
        statusCor: "bg-green-100 text-green-700",
        ultimoAcesso: "18/11/2025",
        criadoEm: "21/11/2024"
    },
    {
        nome: "Pedro Costa",
        email: "caixa@saborrush.com",
        perfil: "Caixa",
        perfilCor: "bg-green-200 text-green-800",
        status: "Ativo",
        statusCor: "bg-green-100 text-green-700",
        ultimoAcesso: "18/11/2025",
        criadoEm: "29/11/2024"
    },
    {
        nome: "Ana Oliveira",
        email: "ana.garcom@saborrush.com",
        perfil: "Garçom/Vendas",
        perfilCor: "bg-blue-200 text-blue-800",
        status: "Inativo",
        statusCor: "bg-red-100 text-red-700",
        ultimoAcesso: "14/10/2024",
        criadoEm: "09/11/2024"
    }
]

export default function GerenciaUsuariosPage() {
    const router = useRouter()

    // Exemplo de valores fixos, pode vir de props ou API depois
    const total = 5
    const ativos = 5
    const inativos = 5
    const admins = 5
    const garcons = 5
    const cozinha = 5
    const caixa = 5

    // Estado da busca
    const [busca, setBusca] = useState("")

    // Filtra usuários pelo nome ou email conforme busca
    const usuariosFiltrados = usuariosMock.filter(user =>
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
                        <p className="text-sm font-medium">Fulan de Tal</p>
                        <p className="text-xs text-gray-500">Admin</p>
                    </div>
                </div>
            </header>

            {/* CARDS */}
            <section className="px-6 py-6 grid grid-cols-7 gap-4">
                <StatusCard label="Total" count={total} />
                <StatusCard label="Ativos" count={ativos} colorClass="bg-green-100 text-green-700 border-green-300" />
                <StatusCard label="Inativos" count={inativos} colorClass="bg-red-100 text-red-700 border-red-300" />
                <StatusCard label="Admins" count={admins} colorClass="bg-purple-100 text-purple-700 border-purple-300" />
                <StatusCard label="Garçons" count={garcons} colorClass="bg-blue-100 text-blue-700 border-blue-300" />
                <StatusCard label="Cozinha" count={cozinha} colorClass="bg-orange-100 text-orange-700 border-orange-300" />
                <StatusCard label="Caixa" count={caixa} colorClass="bg-green-100 text-green-700 border-green-300" />
            </section>

            {/* LISTA DE USUÁRIOS */}
            <section className="px-6 pb-6">
                <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                    <input
                        type="text"
                        placeholder="Buscar por nome ou email..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="flex-grow min-w-[250px] max-w-sm border rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <button
                        onClick={() => alert('Adicionar novo usuário')}
                        className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition"
                    >
                        + Novo Usuário
                    </button>
                </div>

                <div className="overflow-y-auto max-h-[400px] border rounded-md bg-white">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                {["Nome", "E-mail", "Perfil", "Status", "Último Acesso", "Criado em", "Ações"].map((header) => (
                                    <th key={header} className="py-3 px-4 border-b border-gray-200 font-semibold text-gray-700">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {usuariosFiltrados.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-6 text-gray-500">
                                        Nenhum usuário encontrado.
                                    </td>
                                </tr>
                            )}
                            {usuariosFiltrados.map((user, idx) => (
                                <tr key={idx} className="even:bg-gray-50 text-gray-500">
                                    <td className="py-3 px-4 border-b">{user.nome}</td>
                                    <td className="py-3 px-4 border-b">{user.email}</td>
                                    <td className={`py-3 px-4 border-b rounded-md max-w-[150px] text-center ${user.perfilCor}`}>
                                        {user.perfil}
                                    </td>
                                    <td className={`py-3 px-4 border-b rounded-md max-w-[100px] text-center flex items-center justify-center gap-1 ${user.statusCor}`}>
                                        {user.status === "Ativo" ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        )}
                                        <span>{user.status}</span>
                                    </td>
                                    <td className="py-3 px-4 border-b">{user.ultimoAcesso}</td>
                                    <td className="py-3 px-4 border-b">{user.criadoEm}</td>
                                    <td className="py-3 px-4 border-b flex items-center gap-2 text-gray-600">
                                        <button title="Visualizar" className="hover:text-gray-900"><Eye size={16} /></button>
                                        <button title="Editar" className="hover:text-gray-900"><Edit size={16} /></button>
                                        <button title="Resetar senha" className="hover:text-gray-900"><RefreshCcw size={16} /></button>
                                        <button title="Excluir" className="hover:text-red-600"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

        </div>
    )
}
