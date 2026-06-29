import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Calculator, BarChart } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PageLayout, Button } from '../../components/ui';
import SemesterForm from '../../components/cgpa/SemesterForm';
import CgpaChart from '../../components/cgpa/CgpaChart';

/* ── shimmer skeleton for CGPA dashboard ──────────────────────── */
function CgpaSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="h-72 rounded-3xl animate-shimmer" />
      <div className="lg:col-span-2 h-96 rounded-3xl animate-shimmer" />
    </div>
  );
}

/** CGPA — dashboard to record, update, delete semesters, showing live CGPA calculations */
export default function CGPA() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  // Fetch CGPA records
  const fetchCgpaRecords = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cgpa_records')
        .select('*')
        .eq('user_id', user.id)
        .order('semester', { ascending: true });

      if (error) throw error;
      setRecords(data || []);
    } catch (err) {
      console.error('Error fetching CGPA:', err);
      showToast('Failed to load CGPA records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCgpaRecords();
  }, [user]);

  // Form submit handler (adds new or updates existing)
  const handleFormSubmit = async (formData) => {
    if (!user) return;
    try {
      setFormLoading(true);
      const existing = records.find(r => r.semester === formData.semester);

      if (existing) {
        // Edit record
        const { data, error } = await supabase
          .from('cgpa_records')
          .update({ sgpa: formData.sgpa })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        setRecords(prev => prev.map(r => r.id === existing.id ? data : r));
        showToast(`Semester ${formData.semester} SGPA updated`, 'success');
      } else {
        // Add record
        const { data, error } = await supabase
          .from('cgpa_records')
          .insert({
            user_id: user.id,
            semester: formData.semester,
            sgpa: formData.sgpa
          })
          .select()
          .single();

        if (error) throw error;
        setRecords(prev => [...prev, data]);
        showToast(`Semester ${formData.semester} SGPA added`, 'success');
      }
      setEditingRecord(null);
    } catch (err) {
      console.error('Error saving CGPA:', err);
      showToast(err.message || 'Failed to save CGPA record', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete record handler
  const handleDeleteRecord = async (id) => {
    const confirm = window.confirm('Are you sure you want to delete this semester record?');
    if (!confirm) return;

    try {
      const { error } = await supabase
        .from('cgpa_records')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setRecords(prev => prev.filter(r => r.id !== id));
      showToast('Semester record deleted successfully', 'success');
      // If we were editing this record, clear editing state
      if (editingRecord?.id === id) {
        setEditingRecord(null);
      }
    } catch (err) {
      console.error('Error deleting CGPA record:', err);
      showToast('Failed to delete semester record', 'error');
    }
  };

  // Calculate Running CGPA
  const cgpaValue = records.length > 0
    ? (records.reduce((sum, r) => sum + parseFloat(r.sgpa), 0) / records.length).toFixed(2)
    : '0.00';

  return (
    <PageLayout title="CGPA Tracker">
      <div className="flex flex-col gap-6">
        
        {/* Header description */}
        <p className="text-surface-400 text-sm hidden md:block">
          Track semester-wise academic performance and calculate your overall running CGPA.
        </p>

        {/* Prominent CGPA card */}
        <div className="glass p-6 rounded-3xl border border-surface-800/60 flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-r from-surface-900/60 to-brand-950/20 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-400 border border-brand-500/20">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs text-surface-400 font-bold uppercase tracking-wider">Running CGPA</p>
              <h2 className="text-4xl font-extrabold text-brand-400 tracking-tight mt-1">
                {cgpaValue} <span className="text-sm font-normal text-surface-550">/ 10.00</span>
              </h2>
            </div>
          </div>
          <div className="text-xs text-surface-450 font-bold bg-surface-950/60 border border-surface-850 px-4 py-2.5 rounded-xl flex items-center gap-2">
            <Calculator className="w-4 h-4 text-brand-500" />
            <span>Calculated from {records.length} semesters</span>
          </div>
        </div>

        {/* Main layout: forms & charts */}
        {loading ? (
          <CgpaSkeleton />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Form Column */}
            <div className="flex flex-col gap-6">
              <SemesterForm
                onSubmit={handleFormSubmit}
                editingRecord={editingRecord}
                onCancel={() => setEditingRecord(null)}
                loading={formLoading}
              />
            </div>

            {/* List and visual Chart Column */}
            <div className="lg:col-span-2">
              {records.length > 0 ? (
                <CgpaChart
                  records={records}
                  onEdit={setEditingRecord}
                  onDelete={handleDeleteRecord}
                />
              ) : (
                /* Empty state */
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="glass p-12 rounded-3xl text-center flex flex-col items-center border border-surface-800/60 w-full"
                >
                  <div className="w-16 h-16 rounded-2xl bg-surface-800/50 flex items-center justify-center text-surface-400 mb-4 border border-surface-700/50">
                    <BarChart className="w-8 h-8 text-brand-400 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-bold text-surface-100 mb-1">No semesters recorded</h3>
                  <p className="text-sm text-surface-400 mb-6 max-w-xs">
                    Input your first semester SGPA on the left to initialize your visual breakdown and CGPA.
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
