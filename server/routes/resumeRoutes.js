const express = require('express');
const router = express.Router();
const multer = require('multer');
const { requireAuth } = require('../middleware/authMiddleware');
const resumeController = require('../controllers/resumeController');

// Multer in-memory storage for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// All resume routes are protected by auth middleware
router.use(requireAuth);

/** Upload new resume PDF */
router.post('/upload', upload.single('file'), resumeController.uploadResume);

/** Delete resume record */
router.delete('/:id', resumeController.deleteResume);

/** Mark resume as active and deactivate all others */
router.patch('/:id/set-active', resumeController.setActiveResume);

/** Download resume PDF via server-side proxy (bypasses Cloudinary CORS) */
router.get('/:id/download', resumeController.downloadResume);

module.exports = router;
