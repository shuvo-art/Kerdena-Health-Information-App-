import express, { Request, Response } from 'express';
import { SpO2 } from './spo2.model';
import { User } from '../user/user.model';
import { authenticate } from '../auth/auth.middleware';

const router = express.Router();

router.post('/spo2', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { spo2, date } = req.body;
    const userId = req.user?._id;

    const spo2Record = new SpO2({
      user: userId,
      spo2,
      date,
    });

    await spo2Record.save();
    res.status(201).json({ success: true, spo2Record });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ success: false, message: errorMessage });
  }
});

router.get('/spo2/:date', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.params; // Date passed in the URL (e.g., 2025-10-20)
    const userId = req.user?._id;

    if (!date || typeof date !== 'string') {
      res.status(400).json({ success: false, message: 'Invalid date parameter' });
      return;
    }
    const spo2Data = await SpO2.findOne({ user: userId, date: date ? new Date(date as string) : undefined });

    if (!spo2Data) {
      res.status(404).json({ success: false, message: 'No SpO2 data found for this date.' });
      return;
    }

    res.status(200).json({
      success: true,
      spo2Data,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ success: false, message: errorMessage });
  }
});

router.get('/last-7-days', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

    const last7DaysStats = await SpO2.aggregate([
      {
        $match: { user: userId }
      },
      {
        $group: {
          _id: { $dayOfYear: "$date" },
          averageSpO2: { $avg: "$spo2" }, // Calculate the average SpO2 for each day
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

router.get('/spo2-check', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.query;
    const userId = req.user?._id;

    if (!date || typeof date !== 'string') {
      res.status(400).json({ success: false, message: 'Invalid date parameter' });
      return;
    }
    const spo2Data = await SpO2.findOne({ user: userId, date: date ? new Date(date as string) : undefined  });

    if (!spo2Data) {
      res.status(404).json({ success: false, message: 'No SpO2 data found for this date.' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const { spo2Threshold } = user;  // Retrieve the SpO2 threshold from the user model

    let alertMessage = '';
    if (spo2Data.spo2 < (spo2Threshold ?? 0)) {
      alertMessage = `Your SpO2 level is below the threshold of ${spo2Threshold}%. Please take necessary actions.`;
    }

    res.status(200).json({ success: true, spo2Data, alertMessage });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ success: false, message: errorMessage });
  }
});


export default router;
