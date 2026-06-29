const supabaseAdmin = require('../lib/supabaseAdmin');

/** Helper — get the admin's college_id from their profile */
function getCollegeId(req) {
  return req.user.profile.college_id;
}

/** Escape a CSV field value — wrap in quotes if it contains a comma or quote */
function escapeCsvField(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** GET /api/admin/overview — aggregate stats for the admin's college */
exports.getOverview = async (req, res) => {
  const collegeId = getCollegeId(req);
  if (!collegeId) {
    return res.status(400).json({ success: false, message: 'Admin profile is missing college_id' });
  }

  try {
    // Run all queries in parallel for speed
    const [
      studentsResult,
      applicationsResult,
      offersResult,
      cgpaResult,
      companiesResult,
    ] = await Promise.all([
      // Total students in this college
      supabaseAdmin
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'student')
        .eq('college_id', collegeId),

      // Total placement applications for this college's students
      supabaseAdmin
        .from('placements')
        .select('id', { count: 'exact', head: true })
        .in(
          'user_id',
          (await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('role', 'student')
            .eq('college_id', collegeId)
          ).data?.map(p => p.id) || []
        ),

      // Total offers received
      supabaseAdmin
        .from('placements')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'offer')
        .in(
          'user_id',
          (await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('role', 'student')
            .eq('college_id', collegeId)
          ).data?.map(p => p.id) || []
        ),

      // Latest CGPA per student (raw fetch, computed below)
      supabaseAdmin
        .from('cgpa_records')
        .select('user_id, sgpa, recorded_at')
        .order('recorded_at', { ascending: false }),

      // All placements for this college's students (for top companies)
      supabaseAdmin
        .from('placements')
        .select('company_name, user_id')
        .in(
          'user_id',
          (await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('role', 'student')
            .eq('college_id', collegeId)
          ).data?.map(p => p.id) || []
        ),
    ]);

    const totalStudents = studentsResult.count || 0;
    const totalApplications = applicationsResult.count || 0;
    const offersReceived = offersResult.count || 0;

    // Compute average CGPA — average all sgpa records for each student, then average those student CGPAs
    const allCgpaRows = cgpaResult.data || [];
    const studentSgpas = new Map(); // user_id -> array of sgpas
    for (const row of allCgpaRows) {
      if (!studentSgpas.has(row.user_id)) {
        studentSgpas.set(row.user_id, []);
      }
      if (row.sgpa !== null && row.sgpa !== undefined) {
        studentSgpas.get(row.user_id).push(Number(row.sgpa));
      }
    }
    const studentCgpas = [];
    for (const [userId, sgpas] of studentSgpas.entries()) {
      if (sgpas.length > 0) {
        const cgpa = sgpas.reduce((a, b) => a + b, 0) / sgpas.length;
        studentCgpas.push(cgpa);
      }
    }
    const averageCGPA = studentCgpas.length > 0
      ? (studentCgpas.reduce((a, b) => a + b, 0) / studentCgpas.length).toFixed(2)
      : null;

    // Compute top 5 companies by placement count
    const companyCounts = {};
    for (const row of (companiesResult.data || [])) {
      if (row.company_name) {
        companyCounts[row.company_name] = (companyCounts[row.company_name] || 0) + 1;
      }
    }
    const topCompanies = Object.entries(companyCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([company, count]) => ({ company, count }));

    return res.json({
      success: true,
      data: {
        stats: { totalStudents, totalApplications, offersReceived, averageCGPA, topCompanies },
      },
    });
  } catch (err) {
    console.error('Admin overview error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load overview data' });
  }
};

/** GET /api/admin/students — all students in admin's college with stats */
exports.getStudents = async (req, res) => {
  const collegeId = getCollegeId(req);
  const { search, hasOffer } = req.query;

  if (!collegeId) {
    return res.status(400).json({ success: false, message: 'Admin profile is missing college_id' });
  }

  try {
    // Fetch all students in this college
    const { data: students, error: studentsError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'student')
      .eq('college_id', collegeId);

    if (studentsError) throw studentsError;

    if (!students || students.length === 0) {
      return res.json({ success: true, data: { students: [] } });
    }

    const studentIds = students.map(s => s.id);

    // Fetch all placements and cgpa_records in parallel
    const [placementsResult, cgpaResult] = await Promise.all([
      supabaseAdmin
        .from('placements')
        .select('*')
        .in('user_id', studentIds),
      supabaseAdmin
        .from('cgpa_records')
        .select('user_id, sgpa, recorded_at')
        .in('user_id', studentIds)
        .order('recorded_at', { ascending: false }),
    ]);

    const allPlacements = placementsResult.data || [];
    const allCgpa = cgpaResult.data || [];

    // Group SGPAs per student to calculate overall running CGPA
    const studentSgpas = new Map();
    for (const row of allCgpa) {
      if (!studentSgpas.has(row.user_id)) {
        studentSgpas.set(row.user_id, []);
      }
      if (row.sgpa !== null && row.sgpa !== undefined) {
        studentSgpas.get(row.user_id).push(Number(row.sgpa));
      }
    }

    const calculatedCgpa = new Map();
    for (const [userId, sgpas] of studentSgpas.entries()) {
      if (sgpas.length > 0) {
        calculatedCgpa.set(userId, (sgpas.reduce((a, b) => a + b, 0) / sgpas.length).toFixed(2));
      }
    }

    // Build enriched student objects
    let enriched = students.map(student => {
      const placements = allPlacements.filter(p => p.user_id === student.id);
      const offers = placements.filter(p => p.status === 'offer').length;
      return {
        id: student.id,
        full_name: student.full_name,
        email: student.email,
        cgpa: calculatedCgpa.get(student.id) ?? null,
        totalApplications: placements.length,
        offersReceived: offers,
        placements,
      };
    });

    // Apply search filter (case-insensitive, name or email)
    if (search) {
      const q = search.toLowerCase();
      enriched = enriched.filter(s =>
        s.full_name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q)
      );
    }

    // Apply hasOffer filter
    if (hasOffer === 'true') {
      enriched = enriched.filter(s => s.offersReceived > 0);
    }

    return res.json({ success: true, data: { students: enriched } });
  } catch (err) {
    console.error('Admin students error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load students' });
  }
};

/** POST /api/admin/announcements — create a new announcement */
exports.createAnnouncement = async (req, res) => {
  const { title, content } = req.body;
  const collegeId = getCollegeId(req);

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Title is required' });
  }
  if (title.trim().length > 100) {
    return res.status(400).json({ success: false, message: 'Title must be 100 characters or fewer' });
  }
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Content is required' });
  }
  if (content.trim().length > 1000) {
    return res.status(400).json({ success: false, message: 'Content must be 1000 characters or fewer' });
  }

  try {
    const { data: announcement, error } = await supabaseAdmin
      .from('announcements')
      .insert({
        title: title.trim(),
        content: content.trim(),
        admin_id: req.user.id,
        college_id: collegeId,
      })
      .select()
      .single();

    if (error) throw error;

    return res.json({ success: true, data: { announcement } });
  } catch (err) {
    console.error('Create announcement error:', err);
    return res.status(500).json({ success: false, message: 'Failed to publish announcement' });
  }
};

/** GET /api/admin/announcements — all announcements for admin's college */
exports.getAnnouncements = async (req, res) => {
  const collegeId = getCollegeId(req);

  try {
    const { data: announcements, error } = await supabaseAdmin
      .from('announcements')
      .select('*')
      .eq('college_id', collegeId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.json({ success: true, data: { announcements: announcements || [] } });
  } catch (err) {
    console.error('Get announcements error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load announcements' });
  }
};

/** DELETE /api/admin/announcements/:id — delete announcement if owned by this admin */
exports.deleteAnnouncement = async (req, res) => {
  const { id } = req.params;

  try {
    // Verify ownership first
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('announcements')
      .select('id, admin_id')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    if (existing.admin_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only delete your own announcements' });
    }

    const { error: deleteError } = await supabaseAdmin
      .from('announcements')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    return res.json({ success: true, data: { id } });
  } catch (err) {
    console.error('Delete announcement error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete announcement' });
  }
};

/** GET /api/admin/export/placements — stream CSV of all placement data */
exports.exportPlacements = async (req, res) => {
  const collegeId = getCollegeId(req);

  try {
    // Get all students in this college
    const { data: students, error: studentsError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'student')
      .eq('college_id', collegeId);

    if (studentsError) throw studentsError;

    const studentIds = (students || []).map(s => s.id);

    // Get all placements for those students
    const { data: placements, error: placementsError } = await supabaseAdmin
      .from('placements')
      .select('*')
      .in('user_id', studentIds.length > 0 ? studentIds : ['00000000-0000-0000-0000-000000000000'])
      .order('applied_date', { ascending: false });

    if (placementsError) throw placementsError;

    // Build a lookup for student info
    const studentMap = new Map((students || []).map(s => [s.id, s]));

    // Build CSV manually
    const headers = ['Student Name', 'Email', 'Company', 'Role', 'Status', 'Salary Offered', 'Applied Date'];
    const rows = (placements || []).map(p => {
      const student = studentMap.get(p.user_id) || {};
      return [
        escapeCsvField(student.full_name),
        escapeCsvField(student.email),
        escapeCsvField(p.company_name),
        escapeCsvField(p.role),
        escapeCsvField(p.status),
        escapeCsvField(p.salary_offered),
        escapeCsvField(p.applied_date),
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="placements_export.csv"');
    return res.send(csvContent);
  } catch (err) {
    console.error('Export placements error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate export' });
  }
};
