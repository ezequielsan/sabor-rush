import { listarUsuarios } from '@/actions/usuarios'
import UsuariosList from '@/components/UsuariosList'

export default async function UsuariosPage() {
  // Sua função 'listarUsuarios' retorna o array direto (conforme seu código), então usamos await direto.
  const usuarios = await listarUsuarios()

  return (
    <div className="h-full overflow-hidden p-2">
      <UsuariosList usuariosIniciais={usuarios as any[]} />
    </div>
  )
}