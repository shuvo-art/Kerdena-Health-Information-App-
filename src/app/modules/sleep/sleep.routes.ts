import express, { Request, Response } from 'express';
import { Sleep } from './sleep.model';
import { User } from '../user/user.model';
import { authenticate } from '../auth/auth.middleware';

const router = express.Router();

router.post('/sleep', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { totalSleepHours, restfulSleepHours, lightSleepHours, awakeHours, date } = req.body;
    const userId = req.user?._id;

    // Calculate total minutes
    const totalSleepMinutes = totalSleepHours * 60;
    const restfulSleepMinutes = restfulSleepHours * 60;
    const lightSleepMinutes = lightSleepHours * 60;
    const awakeMinutes = awakeHours * 60;

    const sleepRecord = new Sleep({
      user: userId,
      totalSleepHours,
      totalSleepMinutes,
      restfulSleepHours,
      restfulSleepMinutes,
      lightSleepHours,
      lightSleepMinutes,
      awakeHours,
      awakeMinutes,
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
      sleepData: {
        ...sleepData.toObject(),
        totalSleepHours: sleepData.totalSleepHours,
        totalSleepMinutes: sleepData.totalSleepMinutes,
        restfulSleepHours: sleepData.restfulSleepHours,
        restfulSleepMinutes: sleepData.restfulSleepMinutes,
        lightSleepHours: sleepData.lightSleepHours,
        lightSleepMinutes: sleepData.lightSleepMinutes,
        awakeHours: sleepData.awakeHours,
        awakeMinutes: sleepData.awakeMinutes,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ success: false, message: errorMessage });
  }
});

  
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
  
      // Check if restful sleep hours are below threshold
      if (sleepData.restfulSleepHours < (restfulThreshold ?? 0)) {
        message += `Your restful sleep is below the threshold of ${restfulThreshold} hours. You need more restful sleep.\n`;
      }
  
      // Check if light sleep hours are below threshold
      if (sleepData.lightSleepHours < (lightThreshold ?? 0)) {
        message += `Your light sleep is below the threshold of ${lightThreshold} hours. You need more light sleep.\n`;
      }
  
      // Check if awake hours exceed threshold
      if (sleepData.awakeHours > (awakeThreshold ?? 0)) {
        message += `You were awake for more than the threshold of ${awakeThreshold} hours. Try to improve your sleep quality.\n`;
      }
  
      // If no issues found, let the user know everything is fine
      if (!message) {
        message = "Your sleep data is within the recommended thresholds. Keep up the good work!";
      }
  
      res.status(200).json({ success: true, sleepData, message });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ success: false, message: errorMessage });
    }
  });
  
  

export default router;
