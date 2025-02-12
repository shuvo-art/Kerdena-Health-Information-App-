import express, { Request, Response } from 'express';
import { HeartRate } from './heartrate.model';
import { User } from '../user/user.model';
import { authenticate } from '../auth/auth.middleware';

const router = express.Router();

router.post('/heart-rate', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { heartRate, date } = req.body;
    const userId = req.user?._id;

    const heartRateRecord = new HeartRate({
      user: userId,
      heartRate,
      date,
    });

    await heartRateRecord.save();
    res.status(201).json({ success: true, heartRateRecord });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ success: false, message: errorMessage });
  }
});

router.get('/heart-rate/:date', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
      const { date } = req.params; // Date passed in the URL (e.g., 2025-10-20)
      const userId = req.user?._id;
  
      const heartRateData = await HeartRate.findOne({ user: userId, date: new Date(date as string) });
  
      if (!heartRateData) {
        res.status(404).json({ success: false, message: 'No heart rate data found for this date.' });
        return;
      }
  
      res.status(200).json({
        success: true,
        heartRateData,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ success: false, message: errorMessage });
    }
  });

// Route to check if heart rate exceeds the threshold
router.get('/heart-rate-check', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
      const { date } = req.query;
      const userId = req.user?._id;
  
      const heartRateData = await HeartRate.findOne({ user: userId, date: new Date(date as string) });
  
      if (!heartRateData) {
        res.status(404).json({ success: false, message: 'No heart rate data found for this date.' });
        return;
      }
  
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
  
      //const { heartRateThreshold } = user;  // Assuming heartRateThreshold is stored in the User model
  
      let alertMessage = '';
      if (heartRateData.heartRate < 60 || heartRateData.heartRate > 100) {
        alertMessage = `Your heart rate of ${heartRateData.heartRate} BPM is outside the healthy range. Please take rest and monitor your health.`;
      }
  
      res.status(200).json({ success: true, heartRateData, alertMessage });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, message: errorMessage });
        return;
    }
  });
  

  // Route to check heart rate zone and display time spent in each zone
router.get('/heart-rate-zones', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
      const { date } = req.query;
      const userId = req.user?._id;
  
      const heartRateData = await HeartRate.findOne({ user: userId, date: new Date(date as string) });
  
      if (!heartRateData) {
        res.status(404).json({ success: false, message: 'No heart rate data found for this date.' });
        return;
      }
  
      // Logic to calculate time in each heart rate zone
      let timeInZones: { [key: string]: number } = {
        '0-80': 0,
        '80-100': 0,
        '100-110': 0,
        '110+': 0,
      };
  
      // Assuming heartRateData.timeInZone stores the time spent in each zone
      Object.keys(timeInZones).forEach((zone) => {
        timeInZones[zone] = heartRateData.timeInZone[zone];
      });
  
      res.status(200).json({ success: true, timeInZones });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ success: false, message: errorMessage });
    }
  });
  
  
export default router;
