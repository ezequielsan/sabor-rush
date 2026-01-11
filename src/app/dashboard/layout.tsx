import { Sidebar } from '@/components/Sidebar'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const session = cookieStore.get('sabor-session')?.value

  // Se não tiver sessão no layout, o middleware já deve ter barrado,
  // mas por segurança redirecionamos aqui também.
  if (!session) {
    redirect('/')
  }

  const usuario = JSON.parse(session)

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Passamos o perfil para a Sidebar filtrar os itens */}
      <Sidebar perfil={usuario.perfil} />
      
      <main className="flex-1 ml-64 p-8 h-screen overflow-hidden">
        {children}
      </main>
    </div>
  )
}