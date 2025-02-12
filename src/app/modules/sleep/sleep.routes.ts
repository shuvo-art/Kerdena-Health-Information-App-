import express, { Request, Response } from 'express';
import { Sleep } from './sleep.model';
import { User } from '../user/user.model';
import { authenticate } from '../auth/auth.middleware';

const router = express.Router();

router.post('/sleep', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { totalSleepHours, restfulSleepHours, lightSleepHours, awakeHours, date } = req.body;
    const userId = req.user?._id;

    const sleepRecord = new Sleep({
      user: userId,
      totalSleepHours,
      restfulSleepHours,
      lightSleepHours,
      awakeHours,
      date,
    });

    await sleepRecord.save();
    res.status(201).json({ success: true, sleepRecord });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ success: false, message: errorMessage });
  }
});

// Route to get sleep data for a specific date
router.get('/sleep/:date', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
      const { date } = req.params; // Date passed in the URL (e.g., 2025-10-20)
      const userId = req.user?._id;
  
      const sleepData = await Sleep.findOne({ user: userId, date: new Date(date) });
  
      if (!sleepData) {
        res.status(404).json({ success: false, message: 'No sleep data found for this date.' });
        return;
      }
  
      res.status(200).json({
        success: true,
        sleepData,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ success: false, message: errorMessage });
    }
  });
  
  // Route to check if sleep data meets thresholds
  // Route to check if sleep data meets thresholds
router.get('/sleep-check', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
      const { date } = req.query; // date can be string, array, or undefined
      const userId = req.user?._id;
  
      // Ensure the date is a string and not undefined
      if (typeof date !== 'string') {
        res.status(400).json({ success: false, message: 'Invalid or missing date parameter.' });
        return;
      }
  
      const parsedDate = new Date(date);
  
      // Validate if the date is a valid date
      if (isNaN(parsedDate.getTime())) {
        res.status(400).json({ success: false, message: 'Invalid date format.' });
        return;
      }
  
      const sleepData = await Sleep.findOne({ user: userId, date: parsedDate });
  
      if (!sleepData) {
        res.status(404).json({ success: false, message: 'No sleep data found for this date.' });
        return; 
      }
  
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
  
      const { restfulThreshold, lightThreshold, awakeThreshold } = user;
  
      let message = '';
      if (sleepData.restfulSleepHours < (restfulThreshold ?? 0)) {
        message += `Your restful sleep is below the threshold. You need more restful sleep.\n`;
      }
      if (sleepData.lightSleepHours < (lightThreshold ?? 0)) {
        message += `Your light sleep is below the threshold. You need more light sleep.\n`;
      }
      if (sleepData.awakeHours > (awakeThreshold ?? 0)) {
        message += `You were awake for a long time. Try to improve your sleep quality.\n`;
      }
  
      res.status(200).json({ success: true, sleepData, message });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ success: false, message: errorMessage });
    }
  });
  

export default router;
