import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Check, Trash2, Calendar, FileText, Eye } from 'lucide-react';
import { Badge, Button } from '../ui';
import api from '../../lib/api';

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/** ResumeList — renders resume entries, handles active toggles, downloads, and delete confirmations */
export default function ResumeList({ resumes, onSetActive, onDelete, activeLoadingId = null, deleteLoadingId = null }) {
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  return (
    <div className="glass p-6 rounded-3xl border border-surface-800/60 flex flex-col gap-6">
      <h3 className="text-sm font-bold text-surface-200 uppercase tracking-wider">
        Your Resume Versions ({resumes.length})
      </h3>

      <div className="flex flex-col gap-4">
        <AnimatePresence initial={false}>
          {resumes.map((resume) => {
            const isDeleting = deleteLoadingId === resume.id;
            const isActiveLoading = activeLoadingId === resume.id;
            const isConfirmingDelete = deleteConfirmId === resume.id;

            return (
              <motion.div
                key={resume.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  resume.is_active
                    ? 'bg-brand-500/5 border-brand-500/35 shadow-brand-sm'
                    : 'bg-surface-950/30 border-surface-800/80 hover:border-surface-700/60'
                }`}
              >
                {/* Details */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className={`p-2.5 rounded-xl border shrink-0 ${resume.is_active ? 'bg-brand-500/10 border-brand-500/20 text-brand-400' : 'bg-surface-900 border-surface-800 text-surface-400'}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="text-sm font-bold text-surface-100 truncate max-w-[200px]">
                        {resume.version_label}
                      </h4>
                      {resume.is_active && (
                        <Badge text="Active" color="green" size="sm" dot />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-surface-500 mt-1 font-semibold">
                      <Calendar className="w-3 h-3" />
                      <span>Uploaded {formatDate(resume.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-2 sm:mt-0 ml-auto sm:ml-0">
                  {isConfirmingDelete ? (
                    <div className="flex items-center gap-1.5 bg-red-500/5 border border-red-500/15 p-1 rounded-xl">
                      <span className="text-[10px] font-bold text-red-400 px-2">Sure?</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirmId(null)}
                        className="rounded-lg text-[10px] px-2 py-1 h-7"
                      >
                        No
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        loading={isDeleting}
                        onClick={() => {
                          onDelete(resume.id);
                          setDeleteConfirmId(null);
                        }}
                        className="rounded-lg text-[10px] px-2 py-1 h-7"
                      >
                        Delete
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* View */}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => window.open(resume.cloudinary_url, '_blank')}
                        className="rounded-xl text-xs h-9 px-3 flex items-center gap-1.5"
                        title="View PDF"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </Button>

                      {/* Download */}
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={async () => {
                          try {
                            const response = await api.get(
                              `/api/resume/${resume.id}/download`,
                              { responseType: 'blob' }
                            );
                            const blob = new Blob([response.data], { type: 'application/pdf' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = resume.version_label + '.pdf';
                            link.click();
                            URL.revokeObjectURL(url);
                          } catch (err) {
                            alert('Download failed. Please try again.');
                          }
                        }}
                        className="rounded-xl text-xs h-9 px-3 flex items-center gap-1.5"
                        title="Download PDF"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </Button>

                      {/* Set Active */}
                      {!resume.is_active && (
                        <Button
                          variant="outline"
                          size="sm"
                          loading={isActiveLoading}
                          onClick={() => onSetActive(resume.id)}
                          className="rounded-xl text-xs h-9 px-3"
                        >
                          Make Active
                        </Button>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => setDeleteConfirmId(resume.id)}
                        className="p-2.5 rounded-xl border border-surface-800/80 bg-surface-900 text-surface-550 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 transition-colors"
                        title="Delete resume"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
