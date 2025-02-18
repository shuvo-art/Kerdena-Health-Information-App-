import express, { Request, Response } from 'express';
import { Step } from './steps.model';
import { authenticate } from '../auth/auth.middleware';
import { User } from '../user/user.model';

const router = express.Router();

router.post('/steps', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { steps, distanceKm, caloriesBurned, date, hourlySteps } = req.body;
    const userId = req.user?._id;

    // Calculate minutes walked based on steps
    const stepsPerMinute = 80; // Average walking speed in steps per minute
    const minutesWalked = steps / stepsPerMinute; // Calculate minutes walked

    const stepRecord = new Step({
      user: userId,
      steps,
      distanceKm,
      caloriesBurned,
      date,
      hourlySteps,
      minutesWalked, // Store calculated minutes in the database
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
  
      // Ensure the 'User' model has a field for daily goal and update it
      const user = await User.findByIdAndUpdate(userId, { dailyGoal: target }, { new: true });
  
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
  
      res.status(200).json({ success: true, user }); // Return the updated user with the dailyGoal field
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
          $project: {
            dayOfWeek: { $dayOfWeek: "$date" },
            steps: 1,
            date: 1
          }
        },
        {
          $group: {
            _id: { dayOfWeek: "$dayOfWeek" }, // Group by day of the week
            totalSteps: { $sum: "$steps" }
          }
        },
        {
          $sort: { "_id.dayOfWeek": 1 } // Sort days from Saturday to Friday
        },
        {
          $project: {
            dayOfWeek: "$_id.dayOfWeek",
            totalSteps: 1,
            _id: 0
          }
        }
      ]);
  
      // Map the results to days of the week
      const daysOfWeek = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
      const formattedStats = daysOfWeek.map((day, index) => {
        const dayStat = last7DaysStats.find(stat => stat.dayOfWeek === (index + 1)); // MongoDB returns days from 1 (Sunday) to 7 (Saturday)
        return {
          day,
          totalSteps: dayStat ? dayStat.totalSteps : 0, // If no data, return 0 steps
        };
      });
  
      res.status(200).json({ success: true, last7DaysStats: formattedStats });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ success: false, message: errorMessage });
    }
  });
  

export default router;
