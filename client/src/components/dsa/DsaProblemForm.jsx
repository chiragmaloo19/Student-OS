import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';
import { Button, Input } from '../ui';

const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.22 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};

const drawerVariants = {
  initial: { x: '100%' },
  animate: { x: 0, transition: { type: 'spring', stiffness: 320, damping: 30 } },
  exit:    { x: '100%', transition: { duration: 0.22, ease: 'easeIn' } },
};

const TOPICS = [
  'Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs',
  'DP', 'Sorting', 'Searching', 'Recursion', 'Other'
];

const PLATFORMS = [
  { value: 'leetcode', label: 'LeetCode' },
  { value: 'codeforces', label: 'Codeforces' },
  { value: 'other', label: 'Other' }
];

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy', color: 'border-green-500/30 text-green-400 bg-green-500/10' },
  { value: 'medium', label: 'Medium', color: 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10' },
  { value: 'hard', label: 'Hard', color: 'border-red-500/30 text-red-400 bg-red-500/10' }
];

const isKnownDomain = (val) => {
  if (!val) return true;
  const domains = ['leetcode.com', 'codeforces.com', 'geeksforgeeks.org', 'hackerrank.com', 'hackerearth.com', 'codechef.com', 'atcoder.jp', 'spoj.com', 'github.com'];
  try {
    const lowerVal = val.toLowerCase();
    return domains.some(d => lowerVal.includes(d));
  } catch (e) {
    return false;
  }
};

/** DsaProblemForm — side-over drawer panel for adding/editing a DSA problem */
export default function DsaProblemForm({ isOpen, onClose, onSubmit, problem = null, loading = false }) {
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('leetcode');
  const [difficulty, setDifficulty] = useState('easy');
  const [topic, setTopic] = useState('Arrays');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isSolved, setIsSolved] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (problem) {
      setTitle(problem.title || '');
      setPlatform(problem.platform || 'leetcode');
      setDifficulty(problem.difficulty || 'easy');
      setTopic(problem.topic || 'Arrays');
      setUrl(problem.url || '');
      setNotes(problem.notes || '');
      setIsSolved(problem.is_solved || false);
    } else {
      setTitle('');
      setPlatform('leetcode');
      setDifficulty('easy');
      setTopic('Arrays');
      setUrl('');
      setNotes('');
      setIsSolved(false);
    }
    setErrors({});
  }, [problem, isOpen]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    
    // Simple URL validation if provided
    if (url && !url.trim().startsWith('http://') && !url.trim().startsWith('https://')) {
      newErrors.url = 'URL must start with http:// or https://';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      title: title.trim(),
      platform,
      difficulty,
      topic,
      url: url.trim() || null,
      notes: notes.trim() || null,
      is_solved: isSolved,
      solved_at: isSolved ? new Date().toISOString() : null
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            variants={backdropVariants}
            initial="initial" animate="animate" exit="exit"
            className="fixed inset-0 bg-surface-950/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            variants={drawerVariants}
            initial="initial" animate="animate" exit="exit"
            className="relative w-full max-w-md bg-surface-900 border-l border-surface-800 h-full p-6 flex flex-col shadow-2xl overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-surface-800 mb-6">
              <h2 className="text-xl font-bold text-surface-50">
                {problem ? 'Edit DSA Problem' : 'Log DSA Problem'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-surface-400 hover:text-surface-200 transition-colors p-1.5 hover:bg-surface-800 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-5">
                <Input
                  label="Problem Title"
                  value={title}
                  required
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) setErrors(p => ({ ...p, title: null }));
                  }}
                  placeholder="e.g. Two Sum"
                  error={errors.title}
                />

                {/* Platform pills */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-surface-200">Platform</label>
                  <div className="grid grid-cols-3 gap-2">
                    {PLATFORMS.map((p) => (
                      <motion.button
                        key={p.value}
                        type="button"
                        whileTap={{ scale: 0.94 }}
                        onClick={() => setPlatform(p.value)}
                        className={`py-2 px-3 border rounded-xl text-xs font-semibold text-center transition-all ${
                          platform === p.value
                            ? 'border-brand-500 text-brand-400 bg-brand-500/10 shadow-brand-sm'
                            : 'border-surface-600 text-surface-300 hover:bg-surface-800'
                        }`}
                      >
                        {p.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Difficulty pills */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-surface-200">Difficulty</label>
                  <div className="grid grid-cols-3 gap-2">
                    {DIFFICULTIES.map((d) => (
                      <motion.button
                        key={d.value}
                        type="button"
                        whileTap={{ scale: 0.94 }}
                        onClick={() => setDifficulty(d.value)}
                        className={`py-2 px-3 border rounded-xl text-xs font-semibold text-center transition-all ${
                          difficulty === d.value
                            ? `${d.color} border-current shadow-sm`
                            : 'border-surface-600 text-surface-300 hover:bg-surface-800'
                        }`}
                      >
                        {d.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Topic dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="topic-select" className="text-sm font-semibold text-surface-200">Topic</label>
                  <select
                    id="topic-select"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full bg-surface-800 border border-surface-600 rounded-xl text-surface-100 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
                  >
                    {TOPICS.map((t) => (
                      <option key={t} value={t} className="bg-surface-900 text-surface-100">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Input
                    label="URL (Optional)"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (errors.url) setErrors(p => ({ ...p, url: null }));
                    }}
                    placeholder="e.g. https://leetcode.com/problems/two-sum"
                    error={errors.url}
                  />
                  {url && (url.startsWith('http://') || url.startsWith('https://')) && !isKnownDomain(url) && (
                    <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Warning: URL is from an unrecognized platform domain.
                    </p>
                  )}
                </div>

                {/* Notes & Approach Textarea */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-surface-200">Notes & Approach <span className="text-xs text-surface-500 font-normal">(Optional)</span></label>
                    <span className="text-xs text-surface-500">{notes.length} characters</span>
                  </div>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Used hash map for O(n) solution"
                    className="w-full bg-surface-800 border border-surface-600 rounded-xl text-surface-100 placeholder-surface-500 py-2.5 px-3.5 text-sm min-h-24 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
                  />
                </div>

                {/* Mark as Solved toggle */}
                <div className="flex items-center justify-between p-3.5 bg-surface-800 rounded-xl border border-surface-800 mt-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-surface-200">Mark as Solved</span>
                    <span className="text-xs text-surface-500">Record this immediately as a solve</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSolved}
                      onChange={(e) => setIsSolved(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-100 after:border-surface-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 pt-6 border-t border-surface-800 mt-6 bg-surface-900 sticky bottom-0">
                <Button type="button" variant="secondary" className="flex-1 rounded-xl" onClick={onClose} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1 rounded-xl" loading={loading}>
                  {problem ? 'Save Changes' : 'Log Problem'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
