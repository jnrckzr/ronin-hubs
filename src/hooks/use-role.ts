import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/providers'
import { supabase } from '@/integrations/supabase/client'

export function useRole() {
  const { user, loading: authLoading } = useAuth()
  const [role, setRole] = useState<'admin' | 'limited' | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return // wait for auth to finish first

    if (!user) {
      setRole(null)
      setLoading(false)
      return
    }

    async function fetchRole() {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user!.id)
        .single()


      const r = (data as any)?.role
      setRole(r === 'admin' ? 'admin' : r === 'limited' ? 'limited' : null)
      setLoading(false)
    }

    fetchRole()
  }, [user, authLoading]) // re-runs when auth state changes

  return { role, loading: loading || authLoading, isAdmin: role === 'admin', isLimited: role === 'limited' }
}