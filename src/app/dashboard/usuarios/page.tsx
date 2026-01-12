import { listarUsuarios } from '@/actions/usuarios'
import UsuariosList from '@/components/UsuariosList'

export default async function UsuariosPage() {
  const usuarios = await listarUsuarios()

  return (
    <div className="h-full overflow-hidden p-2">
      <UsuariosList usuariosIniciais={usuarios as any[]} />
    </div>
  )
}