import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session) {
      redirect('/')
    }

    return <>{children}</>
  } catch (error) {
    console.error('Dashboard layout error:', error)
    redirect('/')
  }
}