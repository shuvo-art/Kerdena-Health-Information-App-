import express, { Request, Response } from 'express';
import { Step } from './steps.model';
import { authenticate } from '../auth/auth.middleware';
import { User } from '../user/user.model';

const router = express.Router();

router.post('/steps', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
      const { steps, distanceKm, caloriesBurned, date, hourlySteps } = req.body;
      const userId = req.user?._id;
  
      const stepRecord = new Step({
        user: userId,
        steps,
        distanceKm,
        caloriesBurned,
        date,
        hourlySteps, // Store hourly steps in the database
      });
  
      await stepRecord.save();
      res.status(201).json({ success: true, stepRecord });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ success: false, message: errorMessage });
    }
  });


  router.get('/steps/:date', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
      const { date } = req.params; // Date passed in the URL (e.g., 2025-10-20)
      const userId = req.user?._id;
  
      const stepData = await Step.findOne({ user: userId, date: new Date(date) });
  
      if (!stepData) {
        res.status(404).json({ success: false, message: 'No steps data found for this date.' });
        return;
      }
  
      res.status(200).json({
        success: true,
        stepData,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ success: false, message: errorMessage });
    }
  });
  
  // Add target (Daily Goal) for steps
  router.put('/set-target', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
      const { target } = req.body; // target steps goal
      const userId = req.user?._id;
  
      // Assuming the 'User' model has a field for daily goal.
      const user = await User.findByIdAndUpdate(userId, { dailyGoal: target }, { new: true });
  
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
  
      res.status(200).json({ success: true, user });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ success: false, message: errorMessage });
    }
  });

  router.get('/last-7-days', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?._id;
  
      const last7DaysStats = await Step.aggregate([
        {
          $match: { user: userId }
        },
        {
          $group: {
            _id: { $dayOfYear: "$date" },
            totalSteps: { $sum: "$steps" },
            totalDistance: { $sum: "$distanceKm" },
            totalCalories: { $sum: "$caloriesBurned" }
          }
        },
        {
          $sort: { "_id": 1 } // Sort by date ascending
        },
        {
          $limit: 7 // Limit to the last 7 days
        }
      ]);
  
      res.status(200).json({ success: true, last7DaysStats });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ success: false, message: errorMessage });
    }
  });

export default router;
