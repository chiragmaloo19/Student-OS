import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)
  const userIdRef = useRef(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const sessionUser = session?.user ?? null
      setUser(sessionUser)
      userIdRef.current = sessionUser?.id ?? null
      if (sessionUser) {
        fetchProfile(sessionUser.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // TOKEN_REFRESHED only refreshes the JWT — user didn't change, skip re-render
      if (event === 'TOKEN_REFRESHED') return
      
      const currentId = userIdRef.current
      const newId = session?.user?.id ?? null
      
      // SIGNED_IN fires on tab refocus even when the same user is still logged in
      if (event === 'SIGNED_IN' && currentId === newId) return

      setUser(session?.user ?? null)
      userIdRef.current = newId
      
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

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found: log out the auth user immediately
          await supabase.auth.signOut()
          setUser(null)
          setProfile(null)
          setRole(null)
          userIdRef.current = null
          setAuthError('No Student OS profile associated with this account. Please sign up first.')
          return
        }
        throw error
      }

      setProfile(data)
      setRole(data.role)
      setAuthError(null)
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
    authError,
    setAuthError,
    refreshProfile: (userId) => {
      const id = userId || user?.id
      if (id) {
        setLoading(true)
        return fetchProfile(id)
      }
    },
    signIn: (data) => {
      setAuthError(null)
      return supabase.auth.signInWithPassword(data)
    },
    signUp: (data) => {
      setAuthError(null)
      return supabase.auth.signUp(data)
    },
    signInWithGoogle: () => {
      setAuthError(null)
      return supabase.auth.signInWithOAuth({ provider: 'google' })
    },
    signOut: () => {
      setAuthError(null)
      return supabase.auth.signOut()
    },
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
