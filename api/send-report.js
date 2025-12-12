import { Resend } from 'resend';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { studentName, pdfBase64, reportDate } = req.body;

    if (!studentName || !pdfBase64) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY);

    const fileName = `${studentName.replace(/\s+/g, '_')}_Cognitive_Skills_Report_${new Date().toISOString().split('T')[0]}.pdf`;

    // Send email with PDF attachment
    const data = await resend.emails.send({
      from: 'Assessment Tool <onboarding@resend.dev>',
      to: ['smumair2003@gmail.com'],
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
      attachments: [{
        filename: fileName,
        content: pdfBase64,
      }]
    });

    res.status(200).json({ 
      success: true, 
      message: 'Report sent successfully',
      id: data.id
    });

  } catch (error) {
    console.error('Error sending email:', error);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send email',
      error: error.message 
    });
  }
}
