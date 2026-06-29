import { motion } from 'framer-motion';
import { Flame, CheckCircle, BarChart2 } from 'lucide-react';

const TOPICS = [
  'Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs',
  'DP', 'Sorting', 'Searching', 'Recursion', 'Other'
];

/** Helper to calculate user solved streak */
function calculateStreak(problems) {
  const getLocalDateString = (dateObj) => {
    if (!dateObj) return '';
    const d = new Date(dateObj);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const solvedDates = new Set(
    problems
      .filter(p => p.is_solved && p.solved_at)
      .map(p => getLocalDateString(p.solved_at))
  );

  const todayStr = getLocalDateString(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  let streak = 0;
  let currentDateStr = todayStr;

  if (solvedDates.has(todayStr)) {
    while (solvedDates.has(currentDateStr)) {
      streak++;
      const d = new Date(currentDateStr);
      d.setDate(d.getDate() - 1);
      currentDateStr = getLocalDateString(d);
    }
  } else if (solvedDates.has(yesterdayStr)) {
    currentDateStr = yesterdayStr;
    while (solvedDates.has(currentDateStr)) {
      streak++;
      const d = new Date(currentDateStr);
      d.setDate(d.getDate() - 1);
      currentDateStr = getLocalDateString(d);
    }
  }

  return streak;
}

/** DsaStats — renders overall metrics, difficulty distributions, and topic progress */
export default function DsaStats({ problems }) {
  const totalLogged = problems.length;
  const totalSolved = problems.filter(p => p.is_solved).length;

  const easyProbs = problems.filter(p => p.difficulty === 'easy');
  const easySolved = easyProbs.filter(p => p.is_solved).length;

  const mediumProbs = problems.filter(p => p.difficulty === 'medium');
  const mediumSolved = mediumProbs.filter(p => p.is_solved).length;

  const hardProbs = problems.filter(p => p.difficulty === 'hard');
  const hardSolved = hardProbs.filter(p => p.is_solved).length;

  const streak = calculateStreak(problems);

  return (
    <div className="flex flex-col gap-6">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Solved Card */}
        <div className="glass p-5 rounded-2xl border border-surface-800/60 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Total Solved</p>
            <h4 className="text-2xl font-bold text-surface-100 mt-1">{totalSolved} <span className="text-sm font-normal text-surface-500">/ {totalLogged}</span></h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400 border border-brand-500/20">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Easy Solved Card */}
        <div className="glass p-5 rounded-2xl border border-surface-800/60 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Easy</p>
            <h4 className="text-2xl font-bold text-green-400 mt-1">{easySolved} <span className="text-xs font-normal text-surface-500">/ {easyProbs.length}</span></h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 border border-green-500/20">
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
        </div>

        {/* Medium Solved Card */}
        <div className="glass p-5 rounded-2xl border border-surface-800/60 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Medium</p>
            <h4 className="text-2xl font-bold text-yellow-400 mt-1">{mediumSolved} <span className="text-xs font-normal text-surface-500">/ {mediumProbs.length}</span></h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-400 border border-yellow-500/20">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          </div>
        </div>

        {/* Hard Solved Card */}
        <div className="glass p-5 rounded-2xl border border-surface-800/60 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Hard</p>
            <h4 className="text-2xl font-bold text-red-400 mt-1">{hardSolved} <span className="text-xs font-normal text-surface-500">/ {hardProbs.length}</span></h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 border border-red-500/20">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          </div>
        </div>

        {/* Solved Streak Card */}
        <div className="glass p-5 rounded-2xl border border-surface-800/60 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Current Streak</p>
            <h4 className="text-2xl font-bold text-orange-400 mt-1">{streak} <span className="text-sm font-normal text-surface-500">days</span></h4>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${streak > 0 ? 'bg-orange-500/15 text-orange-400 border-orange-500/30' : 'bg-surface-800 text-surface-500 border-surface-700'}`}>
            <Flame className="w-5 h-5 fill-current" />
          </div>
        </div>
      </div>

      {/* Topic Progress section */}
      <div className="glass p-6 rounded-3xl border border-surface-800/60">
        <div className="flex items-center gap-2 mb-5">
          <BarChart2 className="w-5 h-5 text-brand-400" />
          <h3 className="text-sm font-bold text-surface-200 uppercase tracking-wider">Topic Progress</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {TOPICS.map((topic) => {
            const topicProbs = problems.filter(p => p.topic === topic);
            const total = topicProbs.length;
            const solved = topicProbs.filter(p => p.is_solved).length;
            const percentage = total > 0 ? Math.round((solved / total) * 100) : 0;

            return (
              <div key={topic} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-surface-300">{topic}</span>
                  <span className="text-surface-400">
                    {solved} / {total} <span className="text-brand-400 ml-1.5">({percentage}%)</span>
                  </span>
                </div>
                <div className="h-2 w-full bg-surface-950 rounded-full overflow-hidden border border-surface-800/40">
                  <motion.div
                    className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
