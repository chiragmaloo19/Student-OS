import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, GraduationCap, ArrowRight } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { useAuth } from '../../context/AuthContext'

export function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const { user, role, loading: authLoading, signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  // Redirect if already logged in and role is known
  useEffect(() => {
    if (user && role && !authLoading) {
      navigate(role === 'admin' ? '/admin' : '/dashboard', { replace: true })
    }
  }, [user, role, authLoading, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const { error: signInError } = await signIn({ email, password })
      if (signInError) throw signInError
      // The useEffect will trigger the redirect once AuthContext updates
    } catch (err) {
      console.error(err)
      if (err.message.includes('Invalid login credentials')) {
        setError('Incorrect email or password. Please try again.')
      } else {
        setError('Failed to sign in. Please try again later.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await signInWithGoogle()
      if (error) throw error
    } catch (err) {
      console.error(err)
      setError('Failed to sign in with Google.')
    }
  }

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-gradient shadow-glow mx-auto flex items-center justify-center mb-4">
            <GraduationCap size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-surface-50">Welcome back</h1>
          <p className="text-surface-400 text-sm mt-1">Sign in to your Student OS account</p>
        </div>

        <Card padding="lg">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3 text-center">
                {error}
              </div>
            )}
            <Input
              id="login-email"
              label="Email address"
              type="email"
              placeholder="you@college.edu"
              icon={<Mail size={16} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              id="login-password"
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock size={16} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="flex justify-end">
              <button type="button" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-1"
              iconRight={!loading ? <ArrowRight size={16} /> : null}
            >
              Sign in
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-surface-900 text-surface-400">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full bg-surface-800 border-surface-700 hover:bg-surface-700 text-surface-200"
              onClick={handleGoogleSignIn}
            >
              Google
            </Button>
          </form>

          <p className="text-center text-sm text-surface-400 mt-5">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
              Sign up free
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}

export default Login
