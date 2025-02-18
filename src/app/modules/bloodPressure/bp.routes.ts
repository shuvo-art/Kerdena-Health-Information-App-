import express, { Request, Response } from 'express';
import { BloodPressure } from './bp.model';
import { User } from '../user/user.model';
import { authenticate } from '../auth/auth.middleware';

const router = express.Router();

router.post('/blood-pressure', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { systolic, diastolic, date } = req.body;
    const userId = req.user?._id;

    const bpRecord = new BloodPressure({
      user: userId,
      systolic,
      diastolic,
      date,
    });

    await bpRecord.save();
    res.status(201).json({ success: true, bpRecord });
  } catch (error) {
    const errorMessage = (error instanceof Error) ? error.message : 'An unknown error occurred';
    res.status(500).json({ success: false, message: errorMessage });
  }
});

router.get('/blood-pressure/:date', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.params; // Date passed in the URL (e.g., 2025-10-20)
    const userId = req.user?._id;

    const bpData = await BloodPressure.findOne({ user: userId, date: new Date(date as string) });

    if (!bpData) {
      res.status(404).json({ success: false, message: 'No BP data found for this date.' });
      return;
    }

    res.status(200).json({
      success: true,
      bpData,
    });
  } catch (error) {
    const errorMessage = (error instanceof Error) ? error.message : 'An unknown error occurred';
    res.status(500).json({ success: false, message: errorMessage });
  }
});

router.get('/blood-pressure-check', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.query;
    const userId = req.user?._id;

    const bpData = await BloodPressure.findOne({ user: userId, date: new Date(date as string) });

    if (!bpData) {
      res.status(404).json({ success: false, message: 'No BP data found for this date.' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const { systolicThreshold, diastolicThreshold } = user;

    let alertMessage = '';
    // Check if blood pressure exceeds the threshold
    if (bpData.systolic > (systolicThreshold ?? 0) || bpData.diastolic > (diastolicThreshold ?? 0)) {
      alertMessage = `Warning: Your BP of ${bpData.systolic}/${bpData.diastolic} exceeds the healthy threshold. Please take action and consult a doctor.`;
    } else {
      // Success message when blood pressure is within the threshold
      alertMessage = `Your BP of ${bpData.systolic}/${bpData.diastolic} is within the healthy range. Keep up the good work!`;
    }

    res.status(200).json({ success: true, bpData, alertMessage });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ success: false, message: errorMessage });
  }
});


router.get('/blood-pressure-zones', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.query;
    const userId = req.user?._id;

    const bpData = await BloodPressure.findOne({ user: userId, date: new Date(date as string) });

    if (!bpData) {
      res.status(404).json({ success: false, message: 'No BP data found for this date.' });
      return;
    }

    // Logic to calculate time spent in each BP zone
    let timeInZones: { [key: string]: number } = {
      'normal': 0,
      'high': 0,
      'hypertension': 0,
    };

    // Assuming bpData.timeInZone stores the time spent in each zone
    Object.keys(timeInZones).forEach((zone: string) => {
      timeInZones[zone] = bpData.timeInZone[zone];
    });

    res.status(200).json({ success: true, timeInZones });
  } catch (error) {
    const errorMessage = (error instanceof Error) ? error.message : 'An unknown error occurred';
    res.status(500).json({ success: false, message: errorMessage });
  }
});


export default router;
