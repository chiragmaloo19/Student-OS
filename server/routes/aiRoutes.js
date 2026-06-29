const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const aiController = require('../controllers/aiController');

// All AI routes require authentication
router.use(requireAuth);

/** Generate an AI study plan from user inputs */
router.post('/generate-plan', aiController.generatePlan);

/** Retrieve last 5 saved plans for the logged-in user */
router.get('/my-plans', aiController.getMyPlans);

/** Delete a specific saved plan (owner only) */
router.delete('/plans/:id', aiController.deletePlan);

module.exports = router;
