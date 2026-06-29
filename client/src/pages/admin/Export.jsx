import { useState } from 'react'
import { Download, FileText, AlertCircle } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../context/ToastContext'
import { supabase } from '../../lib/supabase'

/** Export — admin page to download placement data as CSV */
export default function Export() {
  const { showToast } = useToast()
  const [exporting, setExporting] = useState(false)

  /** Trigger the CSV download by fetching with auth header and creating a blob URL */
  const handleExport = async () => {
    try {
      setExporting(true)

      // Get the access token for the Authorization header
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
      const response = await fetch(`${baseUrl}/api/admin/export/placements`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        const json = await response.json().catch(() => ({}))
        throw new Error(json.message || 'Export failed')
      }

      // Create blob URL and trigger browser download
      const blob = await response.blob()
      const url  = window.URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `placements_export_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      showToast('Export downloaded successfully!', 'success')
    } catch (err) {
      console.error('Export error:', err)
      showToast(err.message || 'Failed to export data', 'error')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-4 flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center gap-3 animate-fade-in">
        <div className="w-10 h-10 rounded-2xl bg-brand-500/15 border border-brand-500/25 flex items-center justify-center text-brand-400">
          <Download size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-surface-50">Data Export</h1>
          <p className="text-surface-400 text-sm mt-0.5">Download college placement data as CSV</p>
        </div>
      </div>

      {/* Export card */}
      <Card padding="lg" className="text-center">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mx-auto mb-5">
          <FileText size={28} />
        </div>

        <h2 className="text-lg font-bold text-surface-100 mb-2">Placement Data Export</h2>
        <p className="text-surface-400 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
          Downloads a CSV file containing all placement records for students in your college.
        </p>

        {/* Column preview */}
        <div className="bg-surface-800/50 rounded-xl border border-surface-700/60 px-4 py-3 mb-6 text-left">
          <p className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Included Columns</p>
          <div className="flex flex-wrap gap-2">
            {['Student Name', 'Email', 'Company', 'Role', 'Status', 'Salary Offered', 'Applied Date'].map(col => (
              <span key={col} className="text-xs px-2 py-1 bg-surface-700 rounded-lg text-surface-300 border border-surface-600">
                {col}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 bg-yellow-500/5 border border-yellow-500/20 rounded-xl px-4 py-3 mb-6 text-left">
          <AlertCircle size={14} className="text-yellow-400 shrink-0" />
          <p className="text-xs text-yellow-300">
            This export contains sensitive student data. Handle with care and in compliance with your institution's data policy.
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          loading={exporting}
          onClick={handleExport}
          icon={<Download size={18} />}
          className="w-full rounded-xl"
        >
          {exporting ? 'Preparing Export…' : 'Export Placement Data'}
        </Button>
      </Card>
    </div>
  )
}
