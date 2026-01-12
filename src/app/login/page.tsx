'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { realizarLogin } from '@/actions/auth' 

export default function LoginPage() {
  const router = useRouter()
  
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [perfilSelecionado, setPerfilSelecionado] = useState<string>('') 
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  const perfis = [
    { id: 'ADMIN', label: 'Administrador' },
    { id: 'CAIXA', label: 'Caixa' },
    { id: 'GARCOM', label: 'Garçom' },
    { id: 'COZINHA', label: 'Cozinheiro' },
  ]

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    
    if (!perfilSelecionado) {
      setErro("Por favor, selecione seu perfil (Admin, Garçom, etc).")
      return
    }

    setLoading(true)

    try {
      const resultado = await realizarLogin(email, senha, perfilSelecionado)

      if (resultado.sucesso) {
        const perfil = resultado.usuario?.perfil

        if (perfil === 'CAIXA') {
          router.push('/dashboard/caixa')
        } 
        else if (perfil === 'COZINHA') {
          router.push('/dashboard/cozinha')
        } 
        else {
          router.push('/dashboard')
        }

        router.refresh()
      } else {
        setErro(resultado.erro || "Falha ao entrar.")
      }
    } catch (err) {
      console.error(err)
      setErro("Erro de conexão. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        
        {/* Cabeçalho / Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <User className="w-12 h-12 text-purple-700" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-normal text-gray-900 mb-1">SaborRush</h1>
          <p className="text-gray-500 text-lg">Sistema de Gestão para Restaurantes</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* Input Email */}
          <div className="space-y-2">
            <label className="text-gray-700 text-lg">Email</label>
            <div className="relative">
              <input
                type="email"
                placeholder="@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder:text-gray-400"
                required
              />
            </div>
          </div>

          {/* Input Senha */}
          <div className="space-y-2">
            <label className="text-gray-700 text-lg">Senha</label>
            <div className="relative">
              <input
                type={mostrarSenha ? "text" : "password"}
                placeholder="*******"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder:text-gray-400"
                required
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Radio Buttons de Perfil */}
          <div className="flex flex-wrap gap-4 justify-between pt-2">
            {perfis.map((perfil) => (
              <label key={perfil.id} className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${perfilSelecionado === perfil.id ? 'border-gray-800' : 'border-gray-400'}`}>
                   {perfilSelecionado === perfil.id && <div className="w-2 h-2 bg-gray-800 rounded-full" />}
                </div>
                <input 
                  type="radio" 
                  name="perfil" 
                  className="hidden" 
                  onChange={() => setPerfilSelecionado(perfil.id)}
                  checked={perfilSelecionado === perfil.id}
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900">{perfil.label}</span>
              </label>
            ))}
          </div>

          {/* Mensagem de Erro */}
          {erro && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
              {erro}
            </div>
          )}

          {/* Botão Entrar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF9933] hover:bg-[#F58920] text-white font-bold py-3 rounded-lg transition-colors text-lg shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          {/* Link Esqueci Senha */}
          <div className="text-center">
            <a href="#" className="text-gray-600 underline hover:text-gray-900 text-sm">
              Esqueceu a senha?
            </a>
          </div>

        </form>
      </div>
    </div>
  )
}