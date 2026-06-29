const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const platformController = require('../controllers/platformController');

// All platform routes are protected by auth middleware
router.use(requireAuth);

/** Connect platform account */
router.post('/connect', platformController.connectPlatform);

/** Trigger sync for a specific platform */
router.post('/sync/:platform', platformController.syncPlatform);

/** Retrieve cached platform stats */
router.get('/stats', platformController.getPlatformStats);

/** Disconnect platform account */
router.delete('/disconnect/:platform', platformController.disconnectPlatform);

module.exports = router;
