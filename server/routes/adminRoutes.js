const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

// All admin routes require both authentication and admin role
router.use(requireAuth, requireRole('admin'));

/** Get aggregated overview stats for admin's college */
router.get('/overview', adminController.getOverview);

/** Get all students in admin's college with stats */
router.get('/students', adminController.getStudents);

/** Create a new announcement */
router.post('/announcements', adminController.createAnnouncement);

/** Get all announcements for admin's college */
router.get('/announcements', adminController.getAnnouncements);

/** Delete a specific announcement (owner-only) */
router.delete('/announcements/:id', adminController.deleteAnnouncement);

/** Export placement data as CSV */
router.get('/export/placements', adminController.exportPlacements);

module.exports = router;
