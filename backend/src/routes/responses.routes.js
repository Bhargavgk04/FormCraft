import express from 'express';
import {
  createResponse,
  listResponsesForForm,
  listAllResponses,
  getUserResponses,
  getResponseById
} from '../controllers/responses.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Response routes with proper authentication
router.post('/', requireAuth, createResponse);
router.get('/user', requireAuth, getUserResponses); // Get current user's responses
router.get('/', requireAuth, requireRole('admin'), listAllResponses); // Must come before /:formId
router.get('/:formId/:responseId', requireAuth, getResponseById);
router.get('/:formId', requireAuth, listResponsesForForm);

export default router;


