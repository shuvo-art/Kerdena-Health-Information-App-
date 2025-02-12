import express from 'express';
import { reportProblem } from './problem.controller';
import multer from 'multer';

const router = express.Router();

// Set up Multer for file uploads
const upload = multer({ dest: 'uploads/' });  // Store files in the 'uploads' directory

// Endpoint for reporting a problem with an optional screenshot
router.post('/report', upload.single('screenshot'), reportProblem);

export default router;
