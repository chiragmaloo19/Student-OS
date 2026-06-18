import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Unauthorized() {
  const { role, signOut } = useAuth()
  
  const dashboardLink = role === 'admin' ? '/admin' : '/dashboard'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        <div>
          <ShieldAlert className="mx-auto h-16 w-16 text-red-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-4 text-sm text-gray-600">
            You don't have permission to view this page. If you believe this is a mistake, please contact support.
          </p>
        </div>
        
        <div className="mt-8 space-y-3">
          <Link
            to={dashboardLink}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Return to Dashboard
          </Link>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
