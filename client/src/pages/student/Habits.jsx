import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CheckSquare, ListTodo, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button, PageLayout, Input } from '../../components/ui';
import HabitCard from '../../components/habits/HabitCard';

/* ── shimmer skeleton for habit cards ─────────────────────────── */
function HabitSkeleton() {
  return (
    <div className="glass p-5 rounded-3xl border border-surface-800/60 flex flex-col gap-4 h-56 overflow-hidden">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <div className="h-4 rounded animate-shimmer w-1/2" />
          <div className="h-3 rounded animate-shimmer w-1/3" />
        </div>
        <div className="h-6 rounded-full animate-shimmer w-16" />
      </div>
      <div className="h-14 rounded-2xl animate-shimmer w-full mt-2" />
      <div className="h-10 rounded-xl animate-shimmer w-full mt-auto" />
    </div>
  );
}

/** Helper to generate Mon-Sun list of week days for current week */
const getWeekDays = () => {
  const today = new Date();
  const day = today.getDay(); // 0 = Sun, 1 = Mon, ...
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push({
      name: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
      dateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      isToday: d.toDateString() === today.toDateString()
    });
  }
  return days;
};

/** Habits — main page showing habit list, inline form, stats bar and log buttons */
export default function Habits() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingHabit, setAddingHabit] = useState(false);
  const [loggingHabitId, setLoggingHabitId] = useState(null);
  const [undoingHabitId, setUndoingHabitId] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [targetDays, setTargetDays] = useState(7);
  const [error, setError] = useState('');

  const weekDays = getWeekDays();
  const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

  // Fetch habits and logs
  const fetchHabitsAndLogs = async () => {
    if (!user) return;
    try {
      setLoading(true);

      const { data: habitsData, error: habitsErr } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (habitsErr) throw habitsErr;

      const { data: logsData, error: logsErr } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', user.id);

      if (logsErr) throw logsErr;

      setHabits(habitsData || []);
      setLogs(logsData || []);
    } catch (err) {
      console.error('Error fetching habits:', err);
      showToast('Failed to load habits tracker data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabitsAndLogs();
  }, [user]);

  // Handle adding habit (inline form)
  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Habit name is required');
      return;
    }

    try {
      setAddingHabit(true);
      const { data, error: dbErr } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          name: name.trim(),
          target_days_per_week: Number(targetDays)
        })
        .select()
        .single();

      if (dbErr) throw dbErr;

      setHabits(prev => [data, ...prev]);
      setName('');
      setTargetDays(7);
      setError('');
      showToast('Habit added successfully', 'success');
    } catch (err) {
      console.error('Error adding habit:', err);
      showToast('Failed to add habit', 'error');
    } finally {
      setAddingHabit(false);
    }
  };

  // Log habit for today
  const handleLogHabit = async (habitId) => {
    try {
      setLoggingHabitId(habitId);
      
      const { data, error: dbErr } = await supabase
        .from('habit_logs')
        .insert({
          habit_id: habitId,
          user_id: user.id,
          logged_date: todayStr
        })
        .select()
        .single();

      if (dbErr) {
        // Unique key violation code is 23505
        if (dbErr.code === '23505') {
          showToast('Already logged for today', 'warning');
          // Add to local state anyway to sync UI if out of sync
          const exists = logs.some(l => l.habit_id === habitId && l.logged_date === todayStr);
          if (!exists) {
            setLogs(prev => [...prev, { habit_id: habitId, user_id: user.id, logged_date: todayStr }]);
          }
          return;
        }
        throw dbErr;
      }

      setLogs(prev => [...prev, data]);
      showToast('Habit logged for today! Keep it up.', 'success');
    } catch (err) {
      console.error('Error logging habit:', err);
      showToast('Failed to log habit', 'error');
    } finally {
      setLoggingHabitId(null);
    }
  };

  // Undo today's habit log
  const handleUndoHabit = async (habitId) => {
    try {
      setUndoingHabitId(habitId);
      const { error: dbErr } = await supabase
        .from('habit_logs')
        .delete()
        .eq('habit_id', habitId)
        .eq('user_id', user.id)
        .eq('logged_date', todayStr);

      if (dbErr) throw dbErr;

      setLogs(prev => prev.filter(l => !(l.habit_id === habitId && l.logged_date === todayStr)));
      showToast('Log removed for today', 'info');
    } catch (err) {
      console.error('Error undoing habit log:', err);
      showToast('Failed to undo log', 'error');
    } finally {
      setUndoingHabitId(null);
    }
  };

  // Delete habit
  const handleDeleteHabit = async (habitId) => {
    try {
      // First delete associated logs (cascading might handle this, but let's be explicit if needed, or let RLS/Cascade handle)
      const { error: logsDelErr } = await supabase
        .from('habit_logs')
        .delete()
        .eq('habit_id', habitId);

      if (logsDelErr) throw logsDelErr;

      const { error: habitDelErr } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId);

      if (habitDelErr) throw habitDelErr;

      setHabits(prev => prev.filter(h => h.id !== habitId));
      setLogs(prev => prev.filter(l => l.habit_id !== habitId));
      showToast('Habit deleted successfully', 'success');
    } catch (err) {
      console.error('Error deleting habit:', err);
      showToast('Failed to delete habit', 'error');
    }
  };

  // Calculate daily progress stats
  const totalHabits = habits.length;
  const loggedTodayCount = habits.filter(h =>
    logs.some(l => l.habit_id === h.id && l.logged_date === todayStr)
  ).length;

  return (
    <PageLayout title="Habit Tracker">
      <div className="flex flex-col gap-6">

        {/* Header description */}
        <p className="text-surface-400 text-sm hidden md:block">
          Build consistency by tracking daily micro-habits and managing weekly completion counts.
        </p>

        {/* Stats bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass p-5 rounded-2xl border border-surface-800/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Total Habits</p>
              <h4 className="text-2xl font-bold text-surface-100 mt-1">{totalHabits}</h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400 border border-brand-500/20">
              <ListTodo className="w-5 h-5" />
            </div>
          </div>

          <div className="glass p-5 rounded-2xl border border-surface-800/60 flex items-center justify-between sm:col-span-2">
            <div className="flex-1 mr-4">
              <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Logged Today</p>
              <h4 className="text-2xl font-bold text-surface-100 mt-1">
                {loggedTodayCount} <span className="text-sm font-normal text-surface-500">/ {totalHabits} habits</span>
              </h4>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <div className="w-24 h-2 bg-surface-950 rounded-full overflow-hidden border border-surface-800/40">
                <div
                  className="h-full bg-brand-500 transition-all duration-300"
                  style={{ width: `${totalHabits > 0 ? (loggedTodayCount / totalHabits) * 100 : 0}%` }}
                />
              </div>
              <span className="text-[10px] text-brand-400 font-bold">
                {totalHabits > 0 ? Math.round((loggedTodayCount / totalHabits) * 100) : 0}% complete
              </span>
            </div>
          </div>
        </div>

        {/* Inline Add Habit Card */}
        <div className="glass p-6 rounded-3xl border border-surface-800/60">
          <form onSubmit={handleAddHabit} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <Input
                label="New Habit Name"
                placeholder="e.g. 30 mins Reading, Meditate, Solve DSA"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                error={error}
                className="bg-surface-950"
              />
            </div>
            <div className="flex flex-col gap-1.5 w-full md:w-44">
              <label htmlFor="target-days-select" className="text-sm font-semibold text-surface-200">Weekly Target</label>
              <select
                id="target-days-select"
                value={targetDays}
                onChange={(e) => setTargetDays(Number(e.target.value))}
                className="w-full bg-surface-950 border border-surface-650 rounded-xl text-surface-100 py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
              >
                {[7, 6, 5, 4, 3, 2, 1].map((x) => (
                  <option key={x} value={x} className="bg-surface-900">
                    {x} {x === 1 ? 'day' : 'days'} / week
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="submit"
              variant="primary"
              loading={addingHabit}
              icon={<Plus className="w-4 h-4" />}
              className="w-full md:w-auto px-6 py-2.5 rounded-xl shrink-0 h-[42px]"
            >
              Add Habit
            </Button>
          </form>
        </div>

        {/* Habits grid listing */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <HabitSkeleton key={i} />)}
          </div>
        ) : habits.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence initial={false}>
              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  logs={logs}
                  onLog={handleLogHabit}
                  onUndo={handleUndoHabit}
                  onDelete={handleDeleteHabit}
                  isLogging={loggingHabitId === habit.id || undoingHabitId === habit.id}
                />
              ))}
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
              <Activity className="w-8 h-8 animate-pulse text-brand-400" />
            </div>
            <h3 className="text-lg font-bold text-surface-100 mb-1">No habits tracked yet</h3>
            <p className="text-sm text-surface-400 mb-6 max-w-xs">
              Add your first micro-habit above to start building long-term consistency.
            </p>
          </motion.div>
        )}
      </div>
    </PageLayout>
  );
}
