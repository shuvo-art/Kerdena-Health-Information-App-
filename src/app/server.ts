import express from 'express';
import authRoutes from './modules/auth/auth.routes';
import subscriptionRoutes from './modules/subscription/subscription.routes';
import userRoutes from './modules/user/user.routes';
import messageRoutes from './modules/messages/messages.routes';
import chatRoutes from './modules/chat/chats.routes';
import policyRoutes from './modules/policy/policy.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import chatbotRoutes from './modules/chatbot/chatbot.routes';
import problemRoutes from './modules/problem/problem.routes';
import stepsRoutes from './modules/steps/steps.routes';
import sleepRoutes from './modules/sleep/sleep.routes';
import heartRateRoutes from './modules/heartRate/heartrate.routes';
import spo2Routes from './modules/spo2/spo2.routes';
import bpRoutes from './modules/bloodPressure/bp.routes';
import healthRoutes from './modules/health/health.routes';
import { authenticate } from './modules/auth/auth.middleware';

const router = express.Router();

// Public routes
router.use('/auth', authRoutes);

// Authenticated routes
router.use('/user', authenticate, userRoutes);

router.use('/messages', authenticate, messageRoutes);
router.use('/chats', authenticate, chatRoutes);

router.use('/subscription', authenticate, subscriptionRoutes);

// Admin-only routes
router.use('/policy', authenticate, policyRoutes);
router.use('/dashboard', authenticate, dashboardRoutes);

// Chatbot routes for authenticated users
router.use('/chatbot', authenticate, chatbotRoutes);
router.use('/problem', problemRoutes);

// Add new routes to the main app
router.use('/steps', authenticate, stepsRoutes);
router.use('/sleep', authenticate, sleepRoutes);
router.use('/heart-rate', authenticate, heartRateRoutes);
router.use('/spo2', authenticate, spo2Routes);
router.use('/blood-pressure', authenticate, bpRoutes);

// Added health data route
router.use('/health', authenticate, healthRoutes);

export default router;
