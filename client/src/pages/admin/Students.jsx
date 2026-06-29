import { useEffect, useState } from 'react'
import { Users, Search, ChevronDown, ChevronUp, Award, Briefcase } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import api from '../../lib/api'

/** Skeleton row for the students table */
function RowSkeleton() {
  return (
    <tr className="border-b border-surface-800/60">
      {[1, 2, 3, 4, 5].map(i => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 rounded animate-shimmer w-3/4" />
        </td>
      ))}
    </tr>
  )
}

/** Status badge color mapping for placement status */
const statusColor = (s) => {
  const m = { offer: 'green', rejected: 'red', interview: 'yellow', applied: 'blue' }
  return m[s] || 'brand'
}

/** Expanded row showing a student's placement records */
function PlacementsExpanded({ placements }) {
  if (!placements || placements.length === 0) {
    return (
      <tr>
        <td colSpan={5} className="px-6 py-4 text-surface-500 text-sm bg-surface-800/30">
          No placement records found for this student.
        </td>
      </tr>
    )
  }
  return (
    <tr>
      <td colSpan={5} className="px-4 py-4 bg-surface-800/30">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1">Placement Records</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {placements.map((p, i) => (
              <div key={i} className="flex items-center justify-between bg-surface-900 rounded-xl px-4 py-2.5 border border-surface-700/60">
                <div>
                  <p className="text-sm font-semibold text-surface-200">{p.company_name || '—'}</p>
                  <p className="text-xs text-surface-500">{p.role || '—'}</p>
                </div>
                <div className="flex items-center gap-2">
                  {p.salary_offered && (
                    <span className="text-xs text-brand-400 font-semibold">₹{p.salary_offered}L</span>
                  )}
                  <Badge text={p.status} color={statusColor(p.status)} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </td>
    </tr>
  )
}

/** Students — admin page with searchable, filterable student table and expandable rows */
export default function Students() {
  const [students,    setStudents]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [hasOffer,    setHasOffer]    = useState(false)
  const [expandedId,  setExpandedId]  = useState(null)
  const [error,       setError]       = useState(null)

  /** Fetch students from backend on mount */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await api.get('/api/admin/students')
        if (res.data.success) setStudents(res.data.data.students)
      } catch (err) {
        console.error('Failed to load students:', err)
        setError('Failed to load students data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  /** Apply client-side search and offer filter */
  const filtered = students.filter(s => {
    const q = search.toLowerCase()
    const matchesSearch = !search || s.full_name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q)
    const matchesOffer  = !hasOffer || s.offersReceived > 0
    return matchesSearch && matchesOffer
  })

  /** Toggle expanded row — only one at a time */
  const toggleExpand = (id) => setExpandedId(prev => (prev === id ? null : id))

  return (
    <div className="max-w-7xl mx-auto py-4 flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center gap-3 animate-fade-in">
        <div className="w-10 h-10 rounded-2xl bg-brand-500/15 border border-brand-500/25 flex items-center justify-center text-brand-400">
          <Users size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-surface-50">Students Directory</h1>
          <p className="text-surface-400 text-sm mt-0.5">
            {loading ? '...' : `${students.length} students enrolled`}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">{error}</div>
      )}

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-surface-800 border border-surface-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setHasOffer(false)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
              !hasOffer ? 'bg-brand-500 border-brand-500 text-white' : 'bg-surface-800 border-surface-700 text-surface-300 hover:border-surface-600'
            }`}
          >
            All Students
          </button>
          <button
            onClick={() => setHasOffer(true)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all flex items-center gap-1.5 ${
              hasOffer ? 'bg-green-600 border-green-600 text-white' : 'bg-surface-800 border-surface-700 text-surface-300 hover:border-surface-600'
            }`}
          >
            <Award size={14} /> Has Offer
          </button>
        </div>
      </div>

      {/* Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-700/60 bg-surface-800/50">
                <th className="px-4 py-3.5 text-left text-xs font-bold text-surface-400 uppercase tracking-wider">Student</th>
                <th className="px-4 py-3.5 text-left text-xs font-bold text-surface-400 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3.5 text-left text-xs font-bold text-surface-400 uppercase tracking-wider">CGPA</th>
                <th className="px-4 py-3.5 text-center text-xs font-bold text-surface-400 uppercase tracking-wider">
                  <Briefcase size={12} className="inline mr-1" />Apps
                </th>
                <th className="px-4 py-3.5 text-center text-xs font-bold text-surface-400 uppercase tracking-wider">
                  <Award size={12} className="inline mr-1" />Offers
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4, 5].map(i => <RowSkeleton key={i} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-surface-500 text-sm">
                    {search || hasOffer ? 'No students match your filters.' : 'No students enrolled yet.'}
                  </td>
                </tr>
              ) : (
                filtered.map(student => (
                  <>
                    <tr
                      key={student.id}
                      onClick={() => toggleExpand(student.id)}
                      className="border-b border-surface-800/60 hover:bg-surface-800/30 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-500/15 flex items-center justify-center text-brand-400 text-xs font-black shrink-0">
                            {student.full_name?.charAt(0) || '?'}
                          </div>
                          <p className="text-sm font-semibold text-surface-200">{student.full_name || '—'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-surface-400">{student.email || '—'}</td>
                      <td className="px-4 py-4 text-sm font-semibold text-surface-200">
                        {student.cgpa !== null && student.cgpa !== undefined ? student.cgpa : 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-center text-sm text-surface-300">{student.totalApplications}</td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className={`text-sm font-bold ${student.offersReceived > 0 ? 'text-green-400' : 'text-surface-500'}`}>
                            {student.offersReceived}
                          </span>
                          <span className="text-surface-600">
                            {expandedId === student.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </span>
                        </div>
                      </td>
                    </tr>
                    {expandedId === student.id && (
                      <PlacementsExpanded key={`${student.id}-exp`} placements={student.placements} />
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
