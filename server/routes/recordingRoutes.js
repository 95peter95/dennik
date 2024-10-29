// routes/recordingRoutes.js
import express from 'express';
import multer from 'multer';
import { createRecording, getAllRecordings } from '../controllers/recordingController.js';

const router = express.Router();

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST route to save recording with upload middleware
router.post('/', upload.single('recording'), createRecording);

// GET route to get all recordings
router.get('/', getAllRecordings);

export default router;