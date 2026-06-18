import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        setLoading(true)
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setRole(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

      setProfile(data)
      setRole(data.role)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    profile,
    role,
    loading,
    refreshProfile: (userId) => {
      const id = userId || user?.id
      if (id) {
        setLoading(true)
        return fetchProfile(id)
      }
    },
    signIn: (data) => supabase.auth.signInWithPassword(data),
    signUp: (data) => supabase.auth.signUp(data),
    signInWithGoogle: () => supabase.auth.signInWithOAuth({ provider: 'google' }),
    signOut: () => supabase.auth.signOut(),
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

export default AuthContext
