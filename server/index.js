I. import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import multer from 'multer';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Email configuration - REPLACE WITH YOUR GMAIL CREDENTIALS
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com', // Replace with your Gmail
    pass: process.env.EMAIL_PASS || 'your-app-password'     // Replace with your Gmail App Password
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.log('Email transporter error:', error);
  } else {
    console.log('Server is ready to send emails');
  }
});

// POST endpoint to send report email
app.post('/api/send-report', async (req, res) => {
  try {
    const { studentName, pdfBase64, reportDate } = req.body;

    if (!studentName || !pdfBase64) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: studentName and pdfBase64' 
      });
    }

    // Convert base64 to buffer
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    const fileName = `${studentName.replace(/\s+/g, '_')}_Cognitive_Skills_Report_${new Date().toISOString().split('T')[0]}.pdf`;

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: 'smumair2003@gmail.com',
      subject: `Cognitive Skills Assessment Report for ${studentName}`,
      html: `
        <h2>Cognitive Skills Assessment Report</h2>
        <p>Hello,</p>
        <p>Please find attached the Cognitive Skills Assessment Report for <strong>${studentName}</strong>.</p>
        
        <p><strong>Report Details:</strong></p>
        <ul>
          <li>Student Name: ${studentName}</li>
          <li>Date Generated: ${reportDate || new Date().toLocaleDateString()}</li>
        </ul>
        
        <p>This is an automated email from the Holistic Assessment Tool.</p>
        
        <p>Best regards,<br>Assessment System</p>
      `,
      attachments: [
        {
          filename: fileName,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);
    
    res.json({ 
      success: true, 
      message: 'Report sent successfully',
      messageId: info.messageId 
    });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send email',
      error: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Email server is running' });
});

app.listen(PORT, () => {
  console.log(`Email server running on port ${PORT}`);
});
