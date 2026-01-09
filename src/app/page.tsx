import { redirect } from 'next/navigation'

export default function Home() {
  // Redireciona automaticamente da raiz para o login
  redirect('/login')
}