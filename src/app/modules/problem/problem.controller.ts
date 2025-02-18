import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

export const reportProblem = async (req: Request, res: Response): Promise<void> => {
  const { email, description } = req.body;
  const screenshot = req.file;  // Multer will store the uploaded file information in req.file

  if (!email || !description) {
    res.status(400).json({ success: false, message: 'Email and description are required.' });
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Admin email used for SMTP
        pass: process.env.EMAIL_PASS,
      },
    });

    // Ensure correct file path resolution
    const filePath = screenshot ? path.resolve(__dirname, '../../uploads', screenshot.filename) : null;

    // Log the file path to help debug
    console.log('Screenshot file path:', filePath);

    // Set up the mail options
    const mailOptions = {
      from: process.env.EMAIL_USER, // Admin email
      to: process.env.ADMIN_EMAIL, // Admin email receiving the message
      subject: 'User Reported Problem',
      text: `Email: ${email}\n\nDescription: ${description}`,
      replyTo: email, // User's email for replies
      attachments: screenshot && filePath
        ? [
            {
              filename: screenshot.originalname,
              path: filePath, // Corrected file path here
            },
          ]
        : [],
    };

    // Check if the file exists before sending the email
    if (screenshot && filePath && !fs.existsSync(filePath)) {
      console.error('File not found at path:', filePath); // Log the path if file is not found
      res.status(500).json({ success: false, message: 'Screenshot file not found.' });
      return;
    }

    // Send the email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'Problem reported successfully.' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Failed to report the problem.' });
  }
};
