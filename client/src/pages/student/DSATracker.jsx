import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, ExternalLink, Edit2, Trash2, Globe } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button, PageLayout, Badge } from '../../components/ui';
import api from '../../lib/api';

// Subcomponents
import DsaStats from '../../components/dsa/DsaStats';
import DsaConnectAccounts from '../../components/dsa/DsaConnectAccounts';
import DsaProblemForm from '../../components/dsa/DsaProblemForm';

/* ── shimmer skeleton for problem cards ───────────────────────── */
function DsaProblemSkeleton() {
  return (
    <div className="glass p-5 rounded-2xl border border-surface-800/60 flex flex-col justify-between gap-3 h-36 overflow-hidden">
      <div className="flex justify-between items-start gap-4">
        <div className="flex gap-3 items-start flex-1">
          <div className="w-5 h-5 rounded-md animate-shimmer shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <div className="h-4 rounded animate-shimmer w-3/4" />
            <div className="h-3 rounded animate-shimmer w-1/3" />
          </div>
        </div>
        <div className="h-5 rounded-full animate-shimmer w-12 shrink-0" />
      </div>
      <div className="flex justify-between items-center pt-3 border-t border-surface-800/40">
        <div className="h-5 rounded-full animate-shimmer w-20" />
        <div className="flex gap-2">
          <div className="w-6 h-6 rounded-lg animate-shimmer" />
          <div className="w-6 h-6 rounded-lg animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

const listVariants = {
  animate: { transition: { staggerChildren: 0.045 } },
};

/** DSATracker — main page displaying platform stats sync, manual tracking cards, filters, and list */
export default function DSATracker() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [problems, setProblems] = useState([]);
  const [profiles, setProfiles] = useState(null);
  const [platformStats, setPlatformStats] = useState({ leetcode: null, codeforces: null });
  
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [expandedProblemId, setExpandedProblemId] = useState(null);

  const handleCardClick = (prob) => {
    if (!prob.notes && !prob.url) return;
    setExpandedProblemId(prev => prev === prob.id ? null : prob.id);
  };

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterTopic, setFilterTopic] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch all initial data
  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);

      // 1. Fetch manual logged problems
      const { data: problemsData, error: problemsErr } = await supabase
        .from('dsa_problems')
        .select('*')
        .order('created_at', { ascending: false });
      if (problemsErr) throw problemsErr;
      setProblems(problemsData || []);

      // 2. Fetch profiles columns
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('leetcode_username, codeforces_username')
        .eq('id', user.id)
        .single();
      if (profileErr) throw profileErr;
      setProfiles(profileData);

      // 3. Fetch cached platform stats from node backend
      const statsRes = await api.get('/api/platform/stats');
      if (statsRes.data.success) {
        setPlatformStats(statsRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching DSA Tracker data:', err);
      showToast('Failed to load DSA tracker data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Callback when platform is connected or synced
  const handlePlatformSyncSuccess = (platform, statsData) => {
    setPlatformStats(prev => ({
      ...prev,
      [platform]: statsData
    }));
    // Re-fetch profiles to ensure usernames are loaded
    supabase
      .from('profiles')
      .select('leetcode_username, codeforces_username')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) setProfiles(data);
      });
  };

  // Callback when platform is disconnected
  const handlePlatformDisconnectSuccess = (platform) => {
    setPlatformStats(prev => ({
      ...prev,
      [platform]: null
    }));
    // Re-fetch profiles to ensure usernames are loaded/null
    supabase
      .from('profiles')
      .select('leetcode_username, codeforces_username')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) setProfiles(data);
      });
  };

  // Add or Edit problem handler
  const handleFormSubmit = async (formData) => {
    if (!user) return;
    try {
      setFormLoading(true);
      if (editingProblem) {
        const { data, error } = await supabase
          .from('dsa_problems')
          .update(formData)
          .eq('id', editingProblem.id)
          .select()
          .single();

        if (error) throw error;
        setProblems(prev => prev.map(p => p.id === editingProblem.id ? data : p));
        showToast('Problem updated successfully', 'success');
      } else {
        const { data, error } = await supabase
          .from('dsa_problems')
          .insert({ ...formData, user_id: user.id })
          .select()
          .single();

        if (error) throw error;
        setProblems(prev => [data, ...prev]);
        showToast('Problem logged successfully', 'success');
      }
      setIsFormOpen(false);
      setEditingProblem(null);
    } catch (err) {
      console.error('Error saving problem:', err);
      showToast(err.message || 'Failed to save problem', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Toggle solved status optimistically
  const handleToggleSolved = async (problem) => {
    const original = [...problems];
    const isSolved = !problem.is_solved;
    const solvedAt = isSolved ? new Date().toISOString() : null;

    setProblems(prev =>
      prev.map(p => p.id === problem.id ? { ...p, is_solved: isSolved, solved_at: solvedAt } : p)
    );

    try {
      const { error } = await supabase
        .from('dsa_problems')
        .update({ is_solved: isSolved, solved_at: solvedAt })
        .eq('id', problem.id);

      if (error) throw error;
      showToast(isSolved ? 'Problem solved! Great job.' : 'Problem marked unsolved', 'success');
    } catch (err) {
      console.error('Error toggling problem status:', err);
      setProblems(original);
      showToast('Failed to update status', 'error');
    }
  };

  // Delete problem handler
  const handleDeleteProblem = async (id) => {
    const confirm = window.confirm('Are you sure you want to delete this problem?');
    if (!confirm) return;

    try {
      const { error } = await supabase
        .from('dsa_problems')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setProblems(prev => prev.filter(p => p.id !== id));
      showToast('Problem deleted successfully', 'success');
    } catch (err) {
      console.error('Error deleting problem:', err);
      showToast('Failed to delete problem', 'error');
    }
  };

  // Client-side filtering logic
  const filteredProblems = problems.filter((prob) => {
    // Title search
    if (searchQuery && !prob.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // Difficulty filter
    if (filterDifficulty !== 'all' && prob.difficulty !== filterDifficulty) {
      return false;
    }
    // Platform filter
    if (filterPlatform !== 'all' && prob.platform !== filterPlatform) {
      return false;
    }
    // Topic filter
    if (filterTopic !== 'all' && prob.topic !== filterTopic) {
      return false;
    }
    // Status filter
    if (filterStatus !== 'all') {
      const isSolved = filterStatus === 'solved';
      if (prob.is_solved !== isSolved) return false;
    }
    return true;
  });

  const dsaTopics = [
    'Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs',
    'DP', 'Sorting', 'Searching', 'Recursion', 'Other'
  ];

  return (
    <PageLayout title="DSA Tracker">
      <div className="flex flex-col gap-8">
        
        {/* Header CTA */}
        <div className="flex items-center justify-between">
          <p className="text-surface-400 text-sm hidden md:block">
            Track your coding practice, connect external platform profiles, and monitor topic coverage.
          </p>
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => { setEditingProblem(null); setIsFormOpen(true); }}
            className="rounded-xl ml-auto"
          >
            Log Problem
          </Button>
        </div>

        {/* Sync Profile Cards */}
        <DsaConnectAccounts
          profiles={profiles}
          stats={platformStats}
          onSyncSuccess={handlePlatformSyncSuccess}
          onDisconnectSuccess={handlePlatformDisconnectSuccess}
        />

        {/* Stats dashboard & Topic Progress */}
        <DsaStats problems={problems} />

        {/* Filters and Search */}
        <div className="glass p-6 rounded-3xl border border-surface-800/60 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search problems by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-950 border border-surface-800 rounded-xl text-surface-100 placeholder-surface-500 py-2.5 pl-10 pr-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
              />
            </div>

            {/* Filter selectors grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:w-auto">
              {/* Difficulty */}
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="bg-surface-950 border border-surface-800 rounded-xl text-surface-300 py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              {/* Platform */}
              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="bg-surface-950 border border-surface-800 rounded-xl text-surface-300 py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
              >
                <option value="all">All Platforms</option>
                <option value="leetcode">LeetCode</option>
                <option value="codeforces">Codeforces</option>
                <option value="other">Other</option>
              </select>

              {/* Topic */}
              <select
                value={filterTopic}
                onChange={(e) => setFilterTopic(e.target.value)}
                className="bg-surface-950 border border-surface-800 rounded-xl text-surface-300 py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
              >
                <option value="all">All Topics</option>
                {dsaTopics.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              {/* Status */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-surface-950 border border-surface-800 rounded-xl text-surface-300 py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
              >
                <option value="all">All Statuses</option>
                <option value="solved">Solved</option>
                <option value="unsolved">Unsolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Problems List grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <DsaProblemSkeleton key={i} />)}
          </div>
        ) : filteredProblems.length > 0 ? (
          <motion.div
            variants={listVariants}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence initial={false}>
              {filteredProblems.map((problem) => {
                const diffColor =
                  problem.difficulty === 'easy' ? 'green' :
                  problem.difficulty === 'medium' ? 'yellow' : 'red';
                const isExpanded = expandedProblemId === problem.id;
                const canExpand = !!(problem.notes || problem.url);

                return (
                  <motion.div
                    key={problem.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => handleCardClick(problem)}
                    className={`glass p-5 rounded-2xl border border-surface-800/60 flex flex-col justify-between gap-4 hover:border-surface-700/80 transition-colors ${canExpand ? 'cursor-pointer' : ''}`}
                  >
                    {/* Header: Checkbox + Title */}
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex gap-3 items-start flex-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={problem.is_solved}
                          onChange={() => handleToggleSolved(problem)}
                          className="w-5 h-5 rounded-md border-surface-700 bg-surface-950 text-brand-500 focus:ring-brand-500 shrink-0 mt-0.5 cursor-pointer accent-brand-500"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-bold truncate leading-snug ${problem.is_solved ? 'text-surface-400 line-through' : 'text-surface-100'}`}>
                            {problem.title}
                          </h4>
                          <span className="text-xs text-surface-400 font-medium block mt-0.5">
                            {problem.topic}
                          </span>
                        </div>
                      </div>
                      <Badge
                        text={problem.difficulty.toUpperCase()}
                        color={diffColor}
                        size="sm"
                        className="shrink-0"
                      />
                    </div>

                    {/* Expandable Section */}
                    {isExpanded && canExpand && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs border-t border-surface-800/40 pt-3 flex flex-col gap-2.5"
                      >
                        {problem.notes && (
                          <div>
                            <p className="font-semibold text-surface-400">Notes & Approach:</p>
                            <p className="text-surface-200 mt-1 whitespace-pre-wrap leading-relaxed">{problem.notes}</p>
                          </div>
                        )}
                        {problem.url && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-semibold text-surface-400">Link:</span>
                            <a
                              href={problem.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand-400 hover:text-brand-300 transition-colors hover:underline inline-flex items-center gap-1"
                            >
                              Open Problem <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Footer: Platform badge + URL + Edit/Delete */}
                    <div className="flex justify-between items-center pt-3 border-t border-surface-800/40 mt-auto" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <Badge
                          text={problem.platform}
                          color={problem.platform === 'leetcode' ? 'yellow' : problem.platform === 'codeforces' ? 'blue' : 'gray'}
                          size="sm"
                        />
                        {problem.url && (
                          <a
                            href={problem.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-surface-500 hover:text-surface-200 transition-colors p-1"
                            title="Go to problem URL"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => { setEditingProblem(problem); setIsFormOpen(true); }}
                          className="text-surface-500 hover:text-surface-200 transition-colors p-1.5 rounded-lg hover:bg-surface-800/50"
                          title="Edit problem"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProblem(problem.id)}
                          className="text-surface-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10"
                          title="Delete problem"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* Empty state */
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="glass p-12 rounded-3xl text-center flex flex-col items-center border border-surface-800/60 max-w-lg mx-auto w-full mt-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-surface-800/50 flex items-center justify-center text-surface-400 mb-4 border border-surface-700/50">
              <Globe className="w-8 h-8 animate-pulse text-brand-400" />
            </div>
            <h3 className="text-lg font-bold text-surface-100 mb-1">No DSA problems logged</h3>
            <p className="text-sm text-surface-400 mb-6 max-w-xs">
              Log your manually solved problems, or adjust your active filters to see matching results.
            </p>
            <Button
              variant="primary"
              onClick={() => { setEditingProblem(null); setIsFormOpen(true); }}
              className="rounded-xl"
            >
              Log First Problem
            </Button>
          </motion.div>
        )}

        {/* Slide-over Form drawer */}
        <DsaProblemForm
          isOpen={isFormOpen}
          onClose={() => { setIsFormOpen(false); setEditingProblem(null); }}
          onSubmit={handleFormSubmit}
          problem={editingProblem}
          loading={formLoading}
        />
      </div>
    </PageLayout>
  );
}
