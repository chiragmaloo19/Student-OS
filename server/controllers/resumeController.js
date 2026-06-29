const cloudinary = require('cloudinary').v2;
const supabaseAdmin = require('../lib/supabaseAdmin');
const axios = require('axios');


// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/** Helper to upload memory buffer to Cloudinary using stream */
const uploadToCloudinary = (fileBuffer, userId, originalName) => {
  return new Promise((resolve, reject) => {
    // Generate clean filename
    const cleanName = originalName.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9-_]/g, '_');
    const publicId = `${Date.now()}_${cleanName}.pdf`;
    
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `student-os/resumes/${userId}`,
        public_id: publicId,
        resource_type: 'raw',   // PDFs must use 'raw', not 'auto' or 'image'
        access_mode: 'public'   // Ensure URL is publicly accessible
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

/** Upload a new resume PDF to Cloudinary and save details in Supabase */
exports.uploadResume = async (req, res) => {
  const userId = req.user.id;
  const { version_label } = req.body;

  if (!version_label || version_label.trim() === '') {
    return res.status(400).json({ success: false, message: 'Version label is required' });
  }

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'PDF file is required' });
  }

  if (req.file.mimetype !== 'application/pdf') {
    return res.status(400).json({ success: false, message: 'Only PDF documents are allowed' });
  }

  // Reject files over 5MB
  if (req.file.size > 5 * 1024 * 1024) {
    return res.status(400).json({ success: false, message: 'File size must be less than 5MB' });
  }

  try {
    const uploadResult = await uploadToCloudinary(req.file.buffer, userId, req.file.originalname);
    
    // Save record to database
    const { data: newResume, error } = await supabaseAdmin
      .from('resumes')
      .insert({
        user_id: userId,
        version_label: version_label.trim(),
        cloudinary_url: uploadResult.secure_url || uploadResult.url,
        cloudinary_public_id: uploadResult.public_id,
        is_active: false
      })
      .select()
      .single();

    if (error) {
      // Clean up Cloudinary file on DB insert failure
      await cloudinary.uploader.destroy(uploadResult.public_id, { resource_type: uploadResult.resource_type });
      throw error;
    }

    return res.json({ success: true, data: newResume });
  } catch (err) {
    console.error('Upload resume error:', err);
    return res.status(500).json({ success: false, message: 'Failed to upload resume file' });
  }
};

/** Delete a resume from both Cloudinary and Supabase */
exports.deleteResume = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    // Fetch resume row to verify ownership
    const { data: resume, error: fetchErr } = await supabaseAdmin
      .from('resumes')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr || !resume) {
      return res.status(404).json({ success: false, message: 'Resume record not found' });
    }

    if (resume.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'You do not have permission to delete this resume' });
    }

    // Delete from Cloudinary
    // Note: PDF files uploaded with resource_type: auto might be stored as "image" or "raw"
    // We can try to delete with resource_type: 'image' first, if that fails, try 'raw' or delete via public id
    try {
      await cloudinary.uploader.destroy(resume.cloudinary_public_id);
    } catch (cErr) {
      console.warn('Cloudinary delete warning (might be raw type):', cErr);
      try {
        await cloudinary.uploader.destroy(resume.cloudinary_public_id, { resource_type: 'raw' });
      } catch (e) {
        console.error('Cloudinary destroy failed:', e);
      }
    }

    // Delete row from DB
    const { error: deleteErr } = await supabaseAdmin
      .from('resumes')
      .delete()
      .eq('id', id);

    if (deleteErr) throw deleteErr;

    return res.json({ success: true, data: { id } });
  } catch (err) {
    console.error('Delete resume error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete resume' });
  }
};

/** Set a specific resume as active and disable all other resumes for the user */
exports.setActiveResume = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    // Fetch resume row to verify ownership
    const { data: resume, error: fetchErr } = await supabaseAdmin
      .from('resumes')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr || !resume) {
      return res.status(404).json({ success: false, message: 'Resume record not found' });
    }

    if (resume.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'You do not have permission to modify this resume' });
    }

    // Deactivate all user's resumes
    const { error: deactivateErr } = await supabaseAdmin
      .from('resumes')
      .update({ is_active: false })
      .eq('user_id', userId);

    if (deactivateErr) throw deactivateErr;

    // Activate selected resume
    const { data: updatedResume, error: activateErr } = await supabaseAdmin
      .from('resumes')
      .update({ is_active: true })
      .eq('id', id)
      .select()
      .single();

    if (activateErr) throw activateErr;

    return res.json({ success: true, data: updatedResume });
  } catch (err) {
    console.error('Set active resume error:', err);
    return res.status(500).json({ success: false, message: 'Failed to set resume as active' });
  }
};
/** GET /api/resume/:id/download — proxy the PDF via server to avoid Cloudinary CORS/auth issues */
exports.downloadResume = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    // Fetch resume row and verify ownership
    const { data: resume, error: fetchErr } = await supabaseAdmin
      .from('resumes')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr || !resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    if (resume.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Fetch the PDF from Cloudinary server-side (bypasses CORS entirely)
    const response = await axios.get(resume.cloudinary_url, { responseType: 'stream' });

    // Stream it back to the client as a download
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${resume.version_label.replace(/[^a-zA-Z0-9-_ ]/g, '_')}.pdf"`,
    });

    response.data.pipe(res);
  } catch (err) {
    console.error('Download resume error:', err);
    return res.status(500).json({ success: false, message: 'Failed to download resume' });
  }
};
