import express from 'express';
import { sendContactMessage } from '../controllers/contactController.js';

const router = express.Router();

// Send contact message
router.post('/', sendContactMessage);

export default router;
