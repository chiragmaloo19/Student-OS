const axios = require('axios');
const supabaseAdmin = require('../lib/supabaseAdmin');

/** Fetch solved statistics from LeetCode public API wrapper */
async function fetchLeetCodeStats(username) {
  try {
    const [solvedRes, skillRes] = await Promise.all([
      axios.get(`https://alfa-leetcode-api.onrender.com/${username}/solved`),
      axios.get(`https://alfa-leetcode-api.onrender.com/skillStats/${username}`).catch(() => ({ data: {} }))
    ]);
    
    if (solvedRes.data.errors || solvedRes.data.error) {
      throw new Error('User not found on LeetCode');
    }
    
    // Merge skill data into raw_data so the frontend can access it
    const raw_data = {
      ...solvedRes.data,
      skills: skillRes.data?.data?.matchedUser?.tagProblemCounts || {}
    };

    return {
      total_solved: solvedRes.data.solvedProblem || 0,
      easy_solved: solvedRes.data.easySolved || 0,
      medium_solved: solvedRes.data.mediumSolved || 0,
      hard_solved: solvedRes.data.hardSolved || 0,
      ranking: null,
      raw_data: raw_data
    };
  } catch (err) {
    throw new Error('Username not found on LeetCode');
  }
}

/** Fetch user profile info from Codeforces official API */
async function fetchCodeforcesStats(username) {
  try {
    const response = await axios.get(`https://codeforces.com/api/user.info?handles=${username}`);
    if (response.data.status !== 'OK' || !response.data.result || response.data.result.length === 0) {
      throw new Error('User not found on Codeforces');
    }
    const profile = response.data.result[0];
    return {
      total_solved: null,
      easy_solved: null,
      medium_solved: null,
      hard_solved: null,
      ranking: profile.rating || 0, // rating maps to ranking column
      raw_data: profile
    };
  } catch (err) {
    throw new Error('Username not found on Codeforces');
  }
}

/** Connect a user's LeetCode or Codeforces account and perform initial sync */
exports.connectPlatform = async (req, res) => {
  const { platform, username } = req.body;
  const userId = req.user.id;

  if (!platform || !username) {
    return res.status(400).json({ success: false, message: 'Platform and username are required' });
  }

  if (platform !== 'leetcode' && platform !== 'codeforces') {
    return res.status(400).json({ success: false, message: 'Invalid platform. Must be leetcode or codeforces' });
  }

  try {
    let stats;
    if (platform === 'leetcode') {
      stats = await fetchLeetCodeStats(username);
    } else {
      stats = await fetchCodeforcesStats(username);
    }

    // Update username in profiles table
    const { error: profileErr } = await supabaseAdmin
      .from('profiles')
      .update({ [`${platform}_username`]: username })
      .eq('id', userId);

    if (profileErr) {
      console.error('Profile update error:', profileErr);
      return res.status(500).json({ success: false, message: 'Failed to update user profile' });
    }

    // Check if cache row already exists
    const { data: existing } = await supabaseAdmin
      .from('platform_stats_cache')
      .select('id')
      .eq('user_id', userId)
      .eq('platform', platform)
      .maybeSingle();

    const cacheData = {
      user_id: userId,
      platform,
      total_solved: stats.total_solved,
      easy_solved: stats.easy_solved,
      medium_solved: stats.medium_solved,
      hard_solved: stats.hard_solved,
      ranking: stats.ranking,
      raw_data: stats.raw_data,
      last_synced_at: new Date().toISOString()
    };

    let finalStats;
    if (existing) {
      const { data, error: updateErr } = await supabaseAdmin
        .from('platform_stats_cache')
        .update(cacheData)
        .eq('id', existing.id)
        .select()
        .single();
      
      if (updateErr) throw updateErr;
      finalStats = data;
    } else {
      const { data, error: insertErr } = await supabaseAdmin
        .from('platform_stats_cache')
        .insert(cacheData)
        .select()
        .single();

      if (insertErr) throw insertErr;
      finalStats = data;
    }

    return res.json({ success: true, data: { stats: finalStats } });
  } catch (err) {
    console.error('Connect platform error:', err);
    return res.status(400).json({ success: false, message: err.message || 'Could not connect platform account' });
  }
};

/** Sync platform stats if more than 15 minutes have passed since the last sync */
exports.syncPlatform = async (req, res) => {
  const { platform } = req.params;
  const userId = req.user.id;

  if (platform !== 'leetcode' && platform !== 'codeforces') {
    return res.status(400).json({ success: false, message: 'Invalid platform' });
  }

  try {
    // Fetch user profile to get connected username
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('leetcode_username, codeforces_username')
      .eq('id', userId)
      .single();

    if (profileErr || !profile) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }

    const username = profile[`${platform}_username`];
    if (!username) {
      return res.status(400).json({ success: false, message: `No ${platform} account connected. Please connect first.` });
    }

    // Fetch existing cache entry to verify rate limit
    const { data: cache } = await supabaseAdmin
      .from('platform_stats_cache')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', platform)
      .maybeSingle();

    if (cache && cache.last_synced_at) {
      const lastSynced = new Date(cache.last_synced_at);
      const diffMs = new Date() - lastSynced;
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 15) {
        const minsLeft = 15 - diffMins;
        return res.status(429).json({
          success: false,
          message: `Synced ${diffMins} minutes ago. Next sync available in ${minsLeft} minutes.`
        });
      }
    }

    // Fetch fresh stats from external APIs
    let stats;
    if (platform === 'leetcode') {
      stats = await fetchLeetCodeStats(username);
    } else {
      stats = await fetchCodeforcesStats(username);
    }

    const cacheData = {
      user_id: userId,
      platform,
      total_solved: stats.total_solved,
      easy_solved: stats.easy_solved,
      medium_solved: stats.medium_solved,
      hard_solved: stats.hard_solved,
      ranking: stats.ranking,
      raw_data: stats.raw_data,
      last_synced_at: new Date().toISOString()
    };

    let finalStats;
    if (cache) {
      const { data, error: updateErr } = await supabaseAdmin
        .from('platform_stats_cache')
        .update(cacheData)
        .eq('id', cache.id)
        .select()
        .single();
      
      if (updateErr) throw updateErr;
      finalStats = data;
    } else {
      const { data, error: insertErr } = await supabaseAdmin
        .from('platform_stats_cache')
        .insert(cacheData)
        .select()
        .single();

      if (insertErr) throw insertErr;
      finalStats = data;
    }

    return res.json({ success: true, data: { stats: finalStats } });
  } catch (err) {
    console.error('Sync platform error:', err);
    return res.status(400).json({ success: false, message: err.message || 'Could not sync platform statistics' });
  }
};

/** Get cached platform stats for the logged-in user */
exports.getPlatformStats = async (req, res) => {
  const userId = req.user.id;

  try {
    const { data: cacheEntries, error } = await supabaseAdmin
      .from('platform_stats_cache')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    const leetcode = cacheEntries.find(entry => entry.platform === 'leetcode') || null;
    const codeforces = cacheEntries.find(entry => entry.platform === 'codeforces') || null;

    return res.json({
      success: true,
      data: { leetcode, codeforces }
    });
  } catch (err) {
    console.error('Get platform stats error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve cached stats' });
  }
};

/** Disconnect platform account and clear cache */
exports.disconnectPlatform = async (req, res) => {
  const { platform } = req.params;
  const userId = req.user.id;

  if (platform !== 'leetcode' && platform !== 'codeforces') {
    return res.status(400).json({ success: false, message: 'Invalid platform. Must be leetcode or codeforces' });
  }

  try {
    // 1. Update username to null in profiles table
    const { error: profileErr } = await supabaseAdmin
      .from('profiles')
      .update({ [`${platform}_username`]: null })
      .eq('id', userId);

    if (profileErr) {
      console.error('Profile update error on disconnect:', profileErr);
      return res.status(500).json({ success: false, message: 'Failed to update user profile' });
    }

    // 2. Delete platform_stats_cache row
    const { error: deleteErr } = await supabaseAdmin
      .from('platform_stats_cache')
      .delete()
      .eq('user_id', userId)
      .eq('platform', platform);

    if (deleteErr) {
      console.error('Cache delete error on disconnect:', deleteErr);
      return res.status(500).json({ success: false, message: 'Failed to delete platform cache statistics' });
    }

    return res.json({ success: true, data: { platform } });
  } catch (err) {
    console.error('Disconnect platform error:', err);
    return res.status(500).json({ success: false, message: 'Could not disconnect platform account' });
  }
};
