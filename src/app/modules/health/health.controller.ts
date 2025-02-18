import { Request, Response } from 'express';
import { Step } from '../steps/steps.model';
import { Sleep } from '../sleep/sleep.model';
import { HeartRate } from '../heartRate/heartrate.model';
import { SpO2 } from '../spo2/spo2.model';
import { BloodPressure } from '../bloodPressure/bp.model';
import { User } from '../user/user.model';
import { authenticate } from '../auth/auth.middleware';

// Corrected the syntax by defining async function separately from the middleware
// Fetch health data with targets and current values
export const getHealthData = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?._id;
      const { date } = req.query;

    // Convert date string to a Date object
    const targetDate = new Date(date as string);

      // Get the target values from the user's profile
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
  
      // Get steps information
      const stepsData = await Step.aggregate([
        { $match: { user: userId, date: targetDate } },
        { $group: { _id: null, totalSteps: { $sum: "$steps" }, totalDistance: { $sum: "$distanceKm" }, totalCalories: { $sum: "$caloriesBurned" } } }
      ]);
  
      // Get sleep information
      const sleepData = await Sleep.aggregate([
        { $match: { user: userId, date: targetDate } },
        { $group: { _id: null, totalSleepHours: { $sum: "$totalSleepHours" }, restfulSleepHours: { $sum: "$restfulSleepHours" }, lightSleepHours: { $sum: "$lightSleepHours" }, awakeHours: { $sum: "$awakeHours" } } }
      ]);
  
      // Get heart rate information
      const heartRateData = await HeartRate.aggregate([
        { $match: { user: userId, date: targetDate } },
        { $group: { _id: null, averageHeartRate: { $avg: "$heartRate" }, timeInZone: { $sum: "$timeInZone" } } }
      ]);
  
      // Get SpO2 information
      const spo2Data = await SpO2.aggregate([
        { $match: { user: userId, date: targetDate } },
        { $group: { _id: null, averageSpo2: { $avg: "$spo2" } } }
      ]);
  
      // Get blood pressure information
      const bpData = await BloodPressure.aggregate([
        { $match: { user: userId, date: targetDate } },
        { $group: { _id: null, systolicAvg: { $avg: "$systolic" }, diastolicAvg: { $avg: "$diastolic" } } }
      ]);
  
      res.status(200).json({
        success: true,
        healthData: {
          steps: {
            totalSteps: stepsData[0]?.totalSteps || 0,
            totalDistance: stepsData[0]?.totalDistance || 0,
            totalCalories: stepsData[0]?.totalCalories || 0,
            targetSteps: user.stepTarget || 10000, // Default target value
            targetCalories: user.calorieTarget || 300, // Default target value
            targetDistance: user.distanceTarget || 5, // Default target value
          },
          sleep: sleepData[0] || {},
          heartRate: heartRateData[0] || {},
          spo2: spo2Data[0] || {},
          bloodPressure: bpData[0] || {},
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ success: false, message: errorMessage });
    }
  };
  