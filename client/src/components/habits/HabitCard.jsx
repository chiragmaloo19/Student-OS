import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Trash2, CheckCircle2, RotateCcw, Trophy } from 'lucide-react';
import { Button } from '../ui';

/** Returns a YYYY-MM-DD string in local time */
function toLocalDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Get the 7 days of the week that contains `anchorDate` (Mon → Sun).
 * Each day has: name, dateStr (YYYY-MM-DD), isToday
 */
function getWeekContaining(anchorDate) {
  const dow = anchorDate.getDay(); // 0 Sun … 6 Sat
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(anchorDate);
  monday.setDate(anchorDate.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const today = new Date();
  const todayStr = toLocalDateStr(today);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push({
      name: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
      dateStr: toLocalDateStr(d),
      isToday: toLocalDateStr(d) === todayStr,
    });
  }
  return days;
}

/** Helper to calculate streak for a specific habit */
function calculateStreak(logs) {
  const logDates = new Set(logs.map(log => log.logged_date));
  const today = new Date();
  const todayStr = toLocalDateStr(today);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toLocalDateStr(yesterday);

  let streak = 0;
  let cur = new Date();

  if (logDates.has(todayStr)) {
    while (logDates.has(toLocalDateStr(cur))) {
      streak++;
      cur.setDate(cur.getDate() - 1);
    }
  } else if (logDates.has(yesterdayStr)) {
    cur = yesterday;
    while (logDates.has(toLocalDateStr(cur))) {
      streak++;
      cur.setDate(cur.getDate() - 1);
    }
  }
  return streak;
}

/**
 * HabitCard — displays a single habit with:
 *  - Current week + optional past week navigation
 *  - Logs visible for any week the user navigates to
 *  - Click-to-log / click-to-undo on TODAY only
 *  - Target locking: can't log more than target times per week
 *  - "Target reached for the week!" banner when weekly target is met
 *  - "Target Missed" indicator when week ended without meeting target
 */
export default function HabitCard({ habit, logs, onLog, onUndo, onDelete, isLogging = false }) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  // weekOffset: 0 = current week, -1 = last week, etc.
  const [weekOffset, setWeekOffset] = useState(0);

  // Filter logs for this habit only
  const habitLogs = logs.filter(log => log.habit_id === habit.id);
  const streak = calculateStreak(habitLogs);
  const totalLogs = habitLogs.length;
  const target = habit.target_days_per_week || 7;

  // Compute the anchor date for the selected week
  const today = new Date();
  const anchorDate = new Date(today);
  anchorDate.setDate(today.getDate() + weekOffset * 7);
  const weekDays = getWeekContaining(anchorDate);

  const todayStr = toLocalDateStr(today);
  const isLoggedToday = habitLogs.some(log => log.logged_date === todayStr);

  // Count how many days in the *displayed* week are logged
  const weekLoggedCount = weekDays.filter(day =>
    habitLogs.some(log => log.logged_date === day.dateStr)
  ).length;

  const weekComplete = weekLoggedCount >= target;
  const weekProgressPct = Math.min(100, Math.round((weekLoggedCount / target) * 100));

  // "Target missed" only applies to past weeks (weekOffset < 0) and the current
  // week only once it has fully passed (Sunday is done). For simplicity:
  // past week = weekOffset < 0 AND not met target
  const isCurrentWeek = weekOffset === 0;
  const lastDayOfWeek = weekDays[6]; // Sunday
  const weekHasPassed = !isCurrentWeek || lastDayOfWeek.dateStr < todayStr;
  const isTargetFailed = weekHasPassed && !weekComplete;

  // Week label for the navigator
  const firstDay = weekDays[0];
  const lastDay = weekDays[6];
  const weekLabel = weekOffset === 0
    ? 'This Week'
    : weekOffset === -1
    ? 'Last Week'
    : `${firstDay.dateStr.slice(5)} – ${lastDay.dateStr.slice(5)}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass p-5 rounded-3xl border border-surface-800/60 flex flex-col gap-4 hover:border-surface-700/80 transition-all duration-300 shadow-xl"
    >
      {/* ── Status banner ───────────────────────────────────── */}
      {isCurrentWeek && (
        weekComplete ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold">
            <Trophy className="w-3.5 h-3.5 shrink-0" />
            <span>Weekly target reached! Great work 🎉</span>
          </div>
        ) : isLoggedToday ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Done for today — keep the streak going!</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 shrink-0" />
            <span>Not logged yet today — don't break the streak!</span>
          </div>
        )
      )}
      {!isCurrentWeek && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-800/60 border border-surface-700/40 text-surface-400 text-xs font-semibold">
          <span>Viewing past week — scroll only</span>
        </div>
      )}

      {/* ── Header: Habit Name & Stats ───────────────────────── */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-bold text-surface-100 leading-tight truncate">{habit.name}</h4>
          <p className="text-xs text-surface-500 mt-0.5 font-semibold">
            Target: <span className="text-brand-400 font-bold">{target}×</span>/wk
            <span className="mx-1.5 text-surface-700">·</span>
            <span className="text-surface-400">{totalLogs} total logs</span>
          </p>
        </div>
        {/* Streak badge */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shrink-0 ${streak > 0 ? 'bg-orange-500/15 border-orange-500/30 text-orange-400' : 'bg-surface-800 border-surface-700 text-surface-400'}`}>
          <Flame className="w-3.5 h-3.5 fill-current" />
          <span>{streak}d</span>
        </div>
      </div>

      {/* ── Week Navigator ──────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setWeekOffset(w => w - 1)}
          className="text-[10px] font-bold text-surface-500 hover:text-surface-200 px-2 py-1 rounded-lg hover:bg-surface-800 transition-colors"
        >
          ← Prev
        </button>
        <span className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">{weekLabel}</span>
        <button
          onClick={() => setWeekOffset(w => Math.min(0, w + 1))}
          disabled={weekOffset === 0}
          className="text-[10px] font-bold text-surface-500 hover:text-surface-200 px-2 py-1 rounded-lg hover:bg-surface-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>

      {/* ── Week Circles ───────────────────────────────────── */}
      <div className="grid grid-cols-7 gap-1.5 bg-surface-950/40 p-3 rounded-2xl border border-surface-800/30">
        {weekDays.map((day) => {
          const isLogged = habitLogs.some(log => log.logged_date === day.dateStr);
          // Only clickable if: it's today AND viewing current week AND (target not yet met OR undoing a log)
          const isClickable = isCurrentWeek && day.isToday && (!weekComplete || isLogged);

          return (
            <div key={day.dateStr} className="flex flex-col items-center gap-1.5">
              <span className={`text-[10px] font-bold ${day.isToday && isCurrentWeek ? 'text-brand-400' : 'text-surface-500'}`}>
                {day.name}
              </span>
              <button
                type="button"
                disabled={!isClickable || isLogging}
                onClick={() => {
                  if (!isClickable) return;
                  if (isLogged) {
                    onUndo(habit.id);
                  } else {
                    onLog(habit.id);
                  }
                }}
                title={
                  !isCurrentWeek
                    ? 'Past week — view only'
                    : !day.isToday
                    ? day.dateStr
                    : isLogged
                    ? 'Click to undo today\'s log'
                    : weekComplete
                    ? `Weekly target of ${target} already reached!`
                    : 'Click to log today'
                }
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                  isLogged
                    ? 'bg-brand-500 text-white shadow-brand'
                    : isCurrentWeek && day.isToday
                    ? weekComplete
                      ? 'border-2 border-surface-700 bg-surface-900 text-surface-600 cursor-not-allowed'
                      : 'border-2 border-brand-500/50 bg-surface-900 text-surface-400 hover:border-brand-400 hover:bg-brand-500/10'
                    : 'bg-surface-900 border border-surface-800/80 text-surface-500'
                } ${isClickable ? 'cursor-pointer' : 'cursor-default'} ${isLogging && isClickable ? 'opacity-50' : ''}`}
              >
                {isLogged ? '✓' : ''}
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Weekly progress bar ─────────────────────────────── */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider">
            Week Progress
          </span>
          <span className={`text-[10px] font-bold ${
            isTargetFailed ? 'text-red-400'
            : weekComplete ? 'text-green-400'
            : 'text-brand-400'
          }`}>
            {isTargetFailed
              ? 'Target Missed ❌'
              : weekComplete
              ? `${weekLoggedCount}/${target} — Complete ✓`
              : `${weekLoggedCount}/${target} days`}
          </span>
        </div>
        <div className="h-1.5 bg-surface-950 rounded-full overflow-hidden border border-surface-800/40">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${weekProgressPct}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              isTargetFailed ? 'bg-red-500'
              : weekComplete ? 'bg-green-500'
              : 'bg-brand-500'
            }`}
          />
        </div>
      </div>

      {/* ── Footer: Action button & Delete ─────────────────── */}
      <div className="flex gap-2.5 items-center border-t border-surface-800/40 pt-4">
        {showConfirmDelete ? (
          <div className="flex items-center gap-2 w-full">
            <span className="text-xs font-bold text-red-400 flex-1">Delete habit?</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConfirmDelete(false)}
              className="rounded-lg text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                onDelete(habit.id);
                setShowConfirmDelete(false);
              }}
              className="rounded-lg text-xs"
            >
              Delete
            </Button>
          </div>
        ) : (
          <>
            {isCurrentWeek ? (
              isLoggedToday ? (
                <Button
                  variant="secondary"
                  loading={isLogging}
                  icon={<RotateCcw className="w-3.5 h-3.5" />}
                  onClick={() => onUndo(habit.id)}
                  className="flex-1 rounded-xl text-sm border-green-500/20 text-green-400 bg-green-500/5 hover:bg-green-500/10"
                >
                  Undo Today
                </Button>
              ) : weekComplete ? (
                <div className="flex-1 text-center text-xs font-bold text-green-400 py-2">
                  🏆 Weekly goal done!
                </div>
              ) : (
                <Button
                  variant="primary"
                  loading={isLogging}
                  onClick={() => onLog(habit.id)}
                  className="flex-1 rounded-xl"
                >
                  Log Today
                </Button>
              )
            ) : (
              <div className="flex-1 text-center text-xs text-surface-500 py-2">
                Past week — view only
              </div>
            )}
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="text-surface-500 hover:text-red-400 transition-colors p-2.5 rounded-xl hover:bg-red-500/10 border border-surface-800/40"
              title="Delete habit"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
