import express from 'express';
import { getHealthData } from './health.controller';
import { authenticate } from '../auth/auth.middleware';

const router = express.Router();

// Health Data - GET route to fetch all health metrics
router.get('/health', authenticate, getHealthData);

export default router;
