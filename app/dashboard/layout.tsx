import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { DashboardFrame } from '@/components/admin/DashboardFrame'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  return <DashboardFrame email={session.user?.email}>{children}</DashboardFrame>
}
