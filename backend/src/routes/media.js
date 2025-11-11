import express from 'express';
import { getMedia, uploadMedia } from '../controllers/mediaController.js';

const router = express.Router();

// Get all media
router.get('/', getMedia);

// Upload media
router.post('/upload', uploadMedia);

export default router;
