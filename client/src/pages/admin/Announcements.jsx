import { useEffect, useState } from 'react'
import { Bell, Trash2, AlertTriangle } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../context/ToastContext'
import api from '../../lib/api'

const TITLE_MAX  = 100
const CONTENT_MAX = 1000

/** Format ISO date to readable string */
function fmtDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Announcements — admin page to publish and manage college announcements */
export default function Announcements() {
  const { showToast } = useToast()

  const [announcements, setAnnouncements] = useState([])
  const [loading,       setLoading]       = useState(true)
  const [publishing,    setPublishing]    = useState(false)
  const [deletingId,    setDeletingId]    = useState(null)
  const [confirmId,     setConfirmId]     = useState(null)

  // Form state
  const [title,   setTitle]   = useState('')
  const [content, setContent] = useState('')

  /** Load all announcements for this college on mount */
  useEffect(() => {
    fetchAnnouncements()
  }, [])

  /** Fetch announcements from API */
  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/admin/announcements')
      if (res.data.success) setAnnouncements(res.data.data.announcements)
    } catch (err) {
      console.error('Failed to load announcements:', err)
      showToast('Failed to load announcements', 'error')
    } finally {
      setLoading(false)
    }
  }

  /** Publish a new announcement */
  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      showToast('Title and content are required', 'error')
      return
    }
    try {
      setPublishing(true)
      const res = await api.post('/api/admin/announcements', { title: title.trim(), content: content.trim() })
      if (res.data.success) {
        setAnnouncements(prev => [res.data.data.announcement, ...prev])
        setTitle('')
        setContent('')
        showToast('Announcement published!', 'success')
      } else {
        showToast(res.data.message || 'Failed to publish', 'error')
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to publish announcement', 'error')
    } finally {
      setPublishing(false)
    }
  }

  /** Delete announcement after inline confirmation */
  const handleDelete = async (id) => {
    try {
      setDeletingId(id)
      const res = await api.delete(`/api/admin/announcements/${id}`)
      if (res.data.success) {
        setAnnouncements(prev => prev.filter(a => a.id !== id))
        setConfirmId(null)
        showToast('Announcement deleted', 'success')
      } else {
        showToast(res.data.message || 'Failed to delete', 'error')
      }
    } catch (err) {
      showToast('Failed to delete announcement', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-4 flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center gap-3 animate-fade-in">
        <div className="w-10 h-10 rounded-2xl bg-brand-500/15 border border-brand-500/25 flex items-center justify-center text-brand-400">
          <Bell size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-surface-50">Announcements</h1>
          <p className="text-surface-400 text-sm mt-0.5">Broadcast messages to all students in your college</p>
        </div>
      </div>

      {/* Publish form */}
      <Card padding="lg">
        <Card.Header>
          <h2 className="font-bold text-surface-100">New Announcement</h2>
        </Card.Header>
        <div className="flex flex-col gap-4">
          {/* Title */}
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-sm font-semibold text-surface-300">Title</label>
              <span className={`text-xs ${title.length > TITLE_MAX ? 'text-red-400' : 'text-surface-500'}`}>
                {title.length}/{TITLE_MAX}
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Infosys Campus Drive — Registration Open"
              maxLength={TITLE_MAX + 10}
              className={`w-full bg-surface-800 border rounded-xl px-4 py-2.5 text-sm text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-colors ${
                title.length > TITLE_MAX ? 'border-red-500' : 'border-surface-700 focus:border-brand-500'
              }`}
            />
          </div>

          {/* Content */}
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-sm font-semibold text-surface-300">Content</label>
              <span className={`text-xs ${content.length > CONTENT_MAX ? 'text-red-400' : 'text-surface-500'}`}>
                {content.length}/{CONTENT_MAX}
              </span>
            </div>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write your announcement here..."
              rows={4}
              maxLength={CONTENT_MAX + 10}
              className={`w-full bg-surface-800 border rounded-xl px-4 py-2.5 text-sm text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-colors resize-none ${
                content.length > CONTENT_MAX ? 'border-red-500' : 'border-surface-700 focus:border-brand-500'
              }`}
            />
          </div>

          <Button
            variant="primary"
            loading={publishing}
            disabled={!title.trim() || !content.trim() || title.length > TITLE_MAX || content.length > CONTENT_MAX}
            onClick={handlePublish}
            icon={<Bell size={14} />}
            className="self-start"
          >
            Publish Announcement
          </Button>
        </div>
      </Card>

      {/* Announcements list */}
      <Card padding="md">
        <Card.Header>
          <h2 className="font-bold text-surface-100">Published Announcements</h2>
        </Card.Header>

        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="py-4 border-b border-surface-800/60 space-y-2">
                <div className="h-4 rounded animate-shimmer w-1/2" />
                <div className="h-3 rounded animate-shimmer w-3/4" />
                <div className="h-3 rounded animate-shimmer w-1/4" />
              </div>
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <p className="text-surface-500 text-sm py-4">No announcements published yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {announcements.map(a => (
              <div key={a.id} className="py-4 border-b border-surface-800/60 last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-surface-100 text-sm">{a.title}</p>
                    <p className="text-surface-400 text-xs mt-0.5 line-clamp-2">
                      {a.content.length > 100 ? a.content.slice(0, 100) + '…' : a.content}
                    </p>
                    <p className="text-surface-600 text-xs mt-1.5">{fmtDate(a.created_at)}</p>
                  </div>

                  {/* Delete with inline confirmation */}
                  {confirmId === a.id ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-red-400 flex items-center gap-1">
                        <AlertTriangle size={12} /> Sure?
                      </span>
                      <Button
                        variant="danger"
                        size="sm"
                        loading={deletingId === a.id}
                        onClick={() => handleDelete(a.id)}
                      >
                        Delete
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setConfirmId(null)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmId(a.id)}
                      className="text-surface-500 hover:text-red-400 transition-colors shrink-0 p-1"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
