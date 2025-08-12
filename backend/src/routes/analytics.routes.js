import express from 'express';
import { getFormAnalytics, getDashboardAnalytics } from '../controllers/analytics.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// All analytics routes require authentication
router.use(requireAuth);

// Get analytics for a specific form
router.get('/forms/:formId', getFormAnalytics);

// Get dashboard analytics for the authenticated user
router.get('/dashboard', getDashboardAnalytics);

export default router;
