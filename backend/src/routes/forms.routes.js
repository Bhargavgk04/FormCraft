import express from 'express';
import {
  listForms,
  createForm,
  getForm,
  updateForm,
  deleteForm,
  publishForm,
  unpublishForm,
  getPublishedForms,
  getPublishedFormById
} from '../controllers/forms.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Public route for browsing published forms
router.get('/published', getPublishedForms);
router.get('/published/:id', getPublishedFormById);

// All form routes require authentication
router.get('/', requireAuth, listForms);
router.post('/', requireAuth, createForm);
router.get('/:id', requireAuth, getForm);
router.put('/:id', requireAuth, updateForm);
router.delete('/:id', requireAuth, deleteForm);
router.patch('/:id/publish', requireAuth, publishForm);
router.patch('/:id/unpublish', requireAuth, unpublishForm);

export default router;


