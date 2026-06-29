import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2, AlertCircle, HelpCircle, Trash2 } from 'lucide-react';
import api from '../../lib/api';
import { Button, Input, Badge } from '../ui';
import { useToast } from '../../context/ToastContext';

/** Helper to format last synced text */
function getRelativeSyncTime(isoString) {
  if (!isoString) return 'Never synced';
  const diffMs = new Date() - new Date(isoString);
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins === 1) return '1 minute ago';
  return `${diffMins} minutes ago`;
}

/** DsaConnectAccounts — connects, disconnects, and syncs platform profiles (LeetCode/Codeforces) */
export default function DsaConnectAccounts({ profiles, stats, onSyncSuccess, onDisconnectSuccess }) {
  const { showToast } = useToast();
  const [lcUsername, setLcUsername] = useState('');
  const [cfUsername, setCfUsername] = useState('');
  const [lcLoading, setLcLoading] = useState(false);
  const [cfLoading, setCfLoading] = useState(false);

  // Disconnect Confirmation States
  const [showLcConfirm, setShowLcConfirm] = useState(false);
  const [showCfConfirm, setShowCfConfirm] = useState(false);

  // Sync usernames when profiles load
  useEffect(() => {
    if (profiles?.leetcode_username) setLcUsername(profiles.leetcode_username);
    if (profiles?.codeforces_username) setCfUsername(profiles.codeforces_username);
  }, [profiles]);

  // Connect platform
  const handleConnect = async (platform, username) => {
    if (!username || username.trim() === '') {
      showToast('Please enter a valid username', 'error');
      return;
    }
    
    const setLoading = platform === 'leetcode' ? setLcLoading : setCfLoading;
    try {
      setLoading(true);
      const response = await api.post('/api/platform/connect', { platform, username: username.trim() });
      if (response.data.success) {
        showToast(`${platform === 'leetcode' ? 'LeetCode' : 'Codeforces'} connected successfully`, 'success');
        onSyncSuccess(platform, response.data.data.stats.stats || response.data.data.stats);
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || `Could not connect to ${platform === 'leetcode' ? 'LeetCode' : 'Codeforces'} right now, please try again later.`;
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Sync platform stats
  const handleSync = async (platform) => {
    const setLoading = platform === 'leetcode' ? setLcLoading : setCfLoading;
    try {
      setLoading(true);
      const response = await api.post(`/api/platform/sync/${platform}`);
      if (response.data.success) {
        showToast(`${platform === 'leetcode' ? 'LeetCode' : 'Codeforces'} synced successfully`, 'success');
        onSyncSuccess(platform, response.data.data.stats);
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Could not sync right now, please try again in a few minutes';
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Disconnect platform account
  const handleDisconnect = async (platform) => {
    const setLoading = platform === 'leetcode' ? setLcLoading : setCfLoading;
    const setShowConfirm = platform === 'leetcode' ? setShowLcConfirm : setShowCfConfirm;
    
    try {
      setLoading(true);
      const response = await api.delete(`/api/platform/disconnect/${platform}`);
      if (response.data.success) {
        showToast(`${platform === 'leetcode' ? 'LeetCode' : 'Codeforces'} disconnected successfully`, 'success');
        setShowConfirm(false);
        if (platform === 'leetcode') setLcUsername('');
        else setCfUsername('');
        onDisconnectSuccess(platform);
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || `Could not disconnect ${platform === 'leetcode' ? 'LeetCode' : 'Codeforces'} right now`;
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const isLcConnected = !!profiles?.leetcode_username;
  const isCfConnected = !!profiles?.codeforces_username;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* LeetCode Card */}
      {isLcConnected && stats?.leetcode ? (
        /* Section B: LeetCode Profile Stats (synced only, custom styling) */
        <div className="bg-surface-900 border border-brand-500/25 p-6 rounded-3xl flex flex-col justify-between h-full min-h-[170px] shadow-lg shadow-brand-500/5 relative overflow-visible">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-surface-200">LeetCode Profile Stats</span>
                <span className="relative group inline-block cursor-pointer text-surface-500 hover:text-surface-300">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-surface-950 text-[10px] text-surface-300 rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 text-center font-normal">
                    Topic breakdown not available from LeetCode's public API
                  </span>
                </span>
              </div>
              <Badge text="From your LeetCode profile" color="yellow" size="sm" />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-surface-500 font-medium">Username</p>
                  <p className="text-sm font-bold text-surface-100 mt-0.5">{profiles.leetcode_username}</p>
                </div>
                {/* Disconnect Button / Confirmation */}
                {showLcConfirm ? (
                  <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-xl">
                    <span className="text-[10px] font-bold text-red-400">Confirm disconnect?</span>
                    <button 
                      onClick={() => handleDisconnect('leetcode')} 
                      className="text-[10px] font-black text-red-400 hover:text-red-300 px-1 hover:underline"
                      disabled={lcLoading}
                    >
                      Yes
                    </button>
                    <button 
                      onClick={() => setShowLcConfirm(false)} 
                      className="text-[10px] font-bold text-surface-400 hover:text-surface-200 px-1"
                      disabled={lcLoading}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowLcConfirm(true)}
                    className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-red-500/10 transition-colors border border-red-500/10"
                  >
                    Disconnect
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center">
                <div className="bg-surface-950 p-2 rounded-xl border border-surface-800">
                  <p className="text-[10px] text-surface-400 font-bold uppercase">Total Solved</p>
                  <p className="text-base font-extrabold text-surface-200 mt-0.5">{stats.leetcode.total_solved || 0}</p>
                </div>
                <div className="bg-surface-950 p-2 rounded-xl border border-surface-800">
                  <p className="text-[10px] text-green-500 font-bold uppercase">Easy</p>
                  <p className="text-base font-extrabold text-green-400 mt-0.5">{stats.leetcode.easy_solved || 0}</p>
                </div>
                <div className="bg-surface-950 p-2 rounded-xl border border-surface-800">
                  <p className="text-[10px] text-yellow-500 font-bold uppercase">Medium</p>
                  <p className="text-base font-extrabold text-yellow-400 mt-0.5">{stats.leetcode.medium_solved || 0}</p>
                </div>
                <div className="bg-surface-950 p-2 rounded-xl border border-surface-800">
                  <p className="text-[10px] text-red-500 font-bold uppercase">Hard</p>
                  <p className="text-base font-extrabold text-red-400 mt-0.5">{stats.leetcode.hard_solved || 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-5 pt-4 border-t border-surface-800/40">
            <span className="text-xs text-surface-500">
              Synced {getRelativeSyncTime(stats.leetcode.last_synced_at)}
            </span>
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className={`w-3.5 h-3.5 ${lcLoading ? 'animate-spin' : ''}`} />}
              onClick={() => handleSync('leetcode')}
              loading={lcLoading}
              className="rounded-lg text-xs"
            >
              Sync Now
            </Button>
          </div>
        </div>
      ) : (
        /* Connect Account State */
        <div className="glass p-6 rounded-3xl border border-surface-800/60 flex flex-col justify-between h-full min-h-[170px]">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-surface-200">Connect LeetCode Account</span>
              <Badge text="Not Connected" color="gray" size="sm" />
            </div>
            <div className="flex flex-col gap-3">
              <Input
                placeholder="Enter LeetCode username"
                value={lcUsername}
                onChange={(e) => setLcUsername(e.target.value)}
                disabled={lcLoading}
                className="bg-surface-950"
              />
              <Button
                variant="primary"
                onClick={() => handleConnect('leetcode', lcUsername)}
                loading={lcLoading}
                className="w-full rounded-xl"
              >
                Connect LeetCode
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Codeforces Card */}
      {isCfConnected && stats?.codeforces ? (
        /* Section C: Codeforces Profile Stats (synced only, custom styling) */
        <div className="bg-surface-900 border border-brand-500/25 p-6 rounded-3xl flex flex-col justify-between h-full min-h-[170px] shadow-lg shadow-brand-500/5 relative overflow-visible">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-surface-200">Codeforces Profile Stats</span>
              <Badge text="From your Codeforces profile" color="blue" size="sm" />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-surface-500 font-medium">Username</p>
                  <p className="text-sm font-bold text-surface-100 mt-0.5">{profiles.codeforces_username}</p>
                </div>
                {/* Disconnect Button / Confirmation */}
                {showCfConfirm ? (
                  <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-xl">
                    <span className="text-[10px] font-bold text-red-400">Confirm disconnect?</span>
                    <button 
                      onClick={() => handleDisconnect('codeforces')} 
                      className="text-[10px] font-black text-red-400 hover:text-red-300 px-1 hover:underline"
                      disabled={cfLoading}
                    >
                      Yes
                    </button>
                    <button 
                      onClick={() => setShowCfConfirm(false)} 
                      className="text-[10px] font-bold text-surface-400 hover:text-surface-200 px-1"
                      disabled={cfLoading}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowCfConfirm(true)}
                    className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-red-500/10 transition-colors border border-red-500/10"
                  >
                    Disconnect
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                <div className="bg-surface-950 p-2.5 rounded-xl border border-surface-800">
                  <p className="text-[10px] text-surface-400 font-bold uppercase">Rating</p>
                  <p className="text-lg font-extrabold text-brand-400 mt-0.5">{stats.codeforces.ranking || 0}</p>
                </div>
                <div className="bg-surface-950 p-2.5 rounded-xl border border-surface-800">
                  <p className="text-[10px] text-surface-400 font-bold uppercase">Rank</p>
                  <p className="text-sm font-extrabold text-surface-200 mt-1">
                    {stats.codeforces.raw_data?.rank || 'Unrated'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-5 pt-4 border-t border-surface-800/40">
            <span className="text-xs text-surface-500">
              Synced {getRelativeSyncTime(stats.codeforces.last_synced_at)}
            </span>
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className={`w-3.5 h-3.5 ${cfLoading ? 'animate-spin' : ''}`} />}
              onClick={() => handleSync('codeforces')}
              loading={cfLoading}
              className="rounded-lg text-xs"
            >
              Sync Now
            </Button>
          </div>
        </div>
      ) : (
        /* Connect Account State */
        <div className="glass p-6 rounded-3xl border border-surface-800/60 flex flex-col justify-between h-full min-h-[170px]">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-surface-200">Connect Codeforces Account</span>
              <Badge text="Not Connected" color="gray" size="sm" />
            </div>
            <div className="flex flex-col gap-3">
              <Input
                placeholder="Enter Codeforces username"
                value={cfUsername}
                onChange={(e) => setCfUsername(e.target.value)}
                disabled={cfLoading}
                className="bg-surface-950"
              />
              <Button
                variant="primary"
                onClick={() => handleConnect('codeforces', cfUsername)}
                loading={cfLoading}
                className="w-full rounded-xl"
              >
                Connect Codeforces
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>

  );
}
