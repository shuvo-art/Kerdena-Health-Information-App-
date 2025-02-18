import express from 'express';
import { reportProblem } from './problem.controller';
import multer from 'multer';
import path from 'path';

// Set up Multer for file uploads, storing them in the root "uploads" directory
const upload = multer({
  dest: path.join(__dirname, '../../uploads'),  // Store files outside of the 'src' directory
});

const router = express.Router();

// Endpoint for reporting a problem with an optional screenshot
router.post('/report', upload.single('screenshot'), reportProblem);

export default router;
