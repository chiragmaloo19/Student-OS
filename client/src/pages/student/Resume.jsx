import { useEffect, useState } from 'react';
import { FileText, CloudLightning, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PageLayout } from '../../components/ui';
import api from '../../lib/api';

// Subcomponents
import ResumeUpload from '../../components/resume/ResumeUpload';
import ResumeList from '../../components/resume/ResumeList';

/* ── shimmer skeleton for Resumes dashboard ───────────────────── */
function ResumeSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="h-80 rounded-3xl animate-shimmer" />
      <div className="lg:col-span-2 h-[400px] rounded-3xl animate-shimmer" />
    </div>
  );
}

/** Resume — main page coordinating resume uploads, list views, and active status updates */
export default function Resume() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  
  const [activeLoadingId, setActiveLoadingId] = useState(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  // Fetch all resumes
  const fetchResumes = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResumes(data || []);
    } catch (err) {
      console.error('Error fetching resumes:', err);
      showToast('Failed to load resumes list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, [user]);

  // Handle uploading PDF resume
  const handleUploadResume = async (file, versionLabel, successCallback) => {
    if (!user) return;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('version_label', versionLabel);

    try {
      setUploading(true);
      setUploadProgress(0);

      const response = await api.post('/api/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });

      if (response.data.success) {
        showToast('Resume uploaded successfully', 'success');
        setResumes(prev => [response.data.data, ...prev]);
        successCallback();
      }
    } catch (err) {
      console.error('Upload error:', err);
      const errMsg = err.response?.data?.message || 'Failed to upload resume file';
      showToast(errMsg, 'error');
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  // Handle setting active resume
  const handleSetActive = async (id) => {
    try {
      setActiveLoadingId(id);
      const response = await api.patch(`/api/resume/${id}/set-active`);
      if (response.data.success) {
        setResumes(prev =>
          prev.map(r => r.id === id ? { ...r, is_active: true } : { ...r, is_active: false })
        );
        showToast('Active resume updated', 'success');
      }
    } catch (err) {
      console.error('Set active error:', err);
      showToast('Failed to change active resume', 'error');
    } finally {
      setActiveLoadingId(null);
    }
  };

  // Handle deleting a resume version
  const handleDeleteResume = async (id) => {
    try {
      setDeleteLoadingId(id);
      const response = await api.delete(`/api/resume/${id}`);
      if (response.data.success) {
        setResumes(prev => prev.filter(r => r.id !== id));
        showToast('Resume deleted successfully', 'success');
      }
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Failed to delete resume', 'error');
    } finally {
      setDeleteLoadingId(null);
    }
  };

  return (
    <PageLayout title="Resume Manager">
      <div className="flex flex-col gap-6">
        
        {/* Header description */}
        <p className="text-surface-400 text-sm hidden md:block">
          Manage multiple versions of your resume and set the active version for applications.
        </p>

        {/* Info banner */}
        <div className="glass p-5 rounded-3xl border border-surface-800/60 flex items-center gap-4 bg-gradient-to-r from-surface-900/60 to-brand-950/20 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-400 border border-brand-500/20 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-surface-250">Placement Synchronization</h4>
            <p className="text-xs text-surface-450 mt-0.5 leading-snug">
              Your active resume is automatically attached when applying for placements or jobs in the portal.
            </p>
          </div>
        </div>

        {/* Dashboard grid */}
        {loading ? (
          <ResumeSkeleton />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Upload Zone Column */}
            <div className="flex flex-col gap-6">
              <ResumeUpload
                onUpload={handleUploadResume}
                loading={uploading}
                uploadProgress={uploadProgress}
              />
            </div>

            {/* Resume Versions List Column */}
            <div className="lg:col-span-2">
              {resumes.length > 0 ? (
                <ResumeList
                  resumes={resumes}
                  onSetActive={handleSetActive}
                  onDelete={handleSetActive ? handleDeleteResume : undefined}
                  activeLoadingId={activeLoadingId}
                  deleteLoadingId={deleteLoadingId}
                />
              ) : (
                /* Empty state */
                <div className="glass p-12 rounded-3xl text-center flex flex-col items-center border border-surface-800/60 w-full">
                  <div className="w-16 h-16 rounded-2xl bg-surface-800/50 flex items-center justify-center text-surface-400 mb-4 border border-surface-700/50">
                    <FileText className="w-8 h-8 text-brand-400 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-bold text-surface-100 mb-1">No resumes uploaded</h3>
                  <p className="text-sm text-surface-400 mb-6 max-w-xs">
                    You haven't uploaded any resume versions. Use the panel on the left to upload your first PDF.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
