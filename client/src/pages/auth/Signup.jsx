import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, GraduationCap, ArrowRight, Shield, Building } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

export function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', collegeCode: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { user, role, loading: authLoading, signUp, refreshProfile } = useAuth()
  const navigate = useNavigate()

  // Redirect if already logged in and role is known
  useEffect(() => {
    if (user && role && !authLoading) {
      navigate(role === 'admin' ? '/admin' : '/dashboard', { replace: true })
    }
  }, [user, role, authLoading, navigate])

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 1. Validate college code
      const { data: college, error: collegeError } = await supabase
        .from('colleges')
        .select('id')
        .eq('code', form.collegeCode.toUpperCase())
        .single()

      if (collegeError || !college) {
        throw new Error('Invalid college code. Please check and try again.')
      }

      // 2. Sign up user
      const { data: authData, error: signUpError } = await signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.name
          }
        }
      })

      if (signUpError) throw signUpError

      // 3. Update profile with role and college_id
      if (authData?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            role: form.role,
            college_id: college.id
          })
          .eq('id', authData.user.id)

        if (profileError) throw profileError
        
        // Force context to fetch the new role since the auto-trigger set it to student
        if (refreshProfile) {
          await refreshProfile(authData.user.id)
        }
      }

      setSuccess(true)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md animate-slide-up">
          <Card padding="lg" className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-500 mx-auto flex items-center justify-center mb-6">
              <Mail size={32} />
            </div>
            <h2 className="text-2xl font-bold text-surface-50">Check your email</h2>
            <p className="text-surface-400">
              We've sent a confirmation link to <strong>{form.email}</strong>. Please click the link to verify your account.
            </p>
            <div className="pt-6">
              <Link to="/login">
                <Button variant="primary" className="w-full">Return to login</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-gradient shadow-glow mx-auto flex items-center justify-center mb-4">
            <GraduationCap size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-surface-50">Create your account</h1>
          <p className="text-surface-400 text-sm mt-1">Join thousands of students on Student OS</p>
        </div>

        <Card padding="lg">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3 text-center">
                {error}
              </div>
            )}
            
            <Input
              id="signup-name"
              label="Full name"
              type="text"
              placeholder="Chirag Maloo"
              icon={<User size={16} />}
              value={form.name}
              onChange={handleChange('name')}
              required
            />
            <Input
              id="signup-email"
              label="College email"
              type="email"
              placeholder="you@college.edu"
              icon={<Mail size={16} />}
              value={form.email}
              onChange={handleChange('email')}
              required
            />
            <Input
              id="signup-password"
              label="Password"
              type="password"
              placeholder="Min 8 characters"
              icon={<Lock size={16} />}
              value={form.password}
              onChange={handleChange('password')}
              hint="Use at least 8 characters with a mix of letters and numbers."
              required
              minLength={8}
            />
            <Input
              id="signup-college"
              label="College Code"
              type="text"
              placeholder="e.g. TEST001"
              icon={<Building size={16} />}
              value={form.collegeCode}
              onChange={handleChange('collegeCode')}
              required
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-surface-200">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'student', label: 'Student',    icon: <GraduationCap size={16} /> },
                  { value: 'admin',   label: 'TPO / Admin', icon: <Shield size={16} /> },
                ].map(({ value, label, icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, role: value }))}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200
                      ${form.role === value
                        ? 'bg-brand-500/20 border-brand-500 text-brand-300'
                        : 'bg-surface-800 border-surface-600 text-surface-400 hover:border-surface-500'
                      }`}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-1"
              iconRight={!loading ? <ArrowRight size={16} /> : null}
            >
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-surface-400 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}

export default Signup
