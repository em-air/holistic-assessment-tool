import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendReportEmailParams {
  to: string[];
  studentName: string;
  pdfBuffer: Buffer;
  reportDate: string;
}

/**
 * Send report PDF via email
 */
export async function sendReportEmail(params: SendReportEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const fileName = `${params.studentName.replace(/\s+/g, '_')}_Assessment_Report_${new Date().toISOString().split('T')[0]}.pdf`;

    const { data, error } = await resend.emails.send({
      from: 'Assessment Tool <onboarding@resend.dev>',
      to: params.to,
      subject: `Holistic Assessment Report for ${params.studentName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .highlight { background: #fff; padding: 15px; border-left: 4px solid #6366f1; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Assessment Report</h1>
              <p>Holistic Assessment Tool</p>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Please find attached the comprehensive assessment report for <strong>${params.studentName}</strong>.</p>
              
              <div class="highlight">
                <p><strong>Report Details:</strong></p>
                <ul>
                  <li>Student Name: ${params.studentName}</li>
                  <li>Date Generated: ${params.reportDate}</li>
                  <li>Report Type: Full Assessment</li>
                </ul>
              </div>
              
              <p>This report includes detailed analysis of:</p>
              <ul>
                <li>🧠 <strong>Mind Skills</strong> - Attention, Memory, Critical Thinking, Perception</li>
                <li>🗣️ <strong>Oral Skills</strong> - Language, Reading, Phonics, Blending</li>
                <li>📚 <strong>Academic Skills</strong> - Writing, Vocabulary, Spelling</li>
              </ul>
              
              <p>Please review the recommendations section for personalized suggestions to support your child's learning journey.</p>
              
              <div class="footer">
                <p>This is an automated email from the Holistic Assessment Tool.</p>
                <p>© ${new Date().getFullYear()} Bloom Tutoring</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [{
        filename: fileName,
        content: params.pdfBuffer,
      }],
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (error: any) {
    console.error('Email service error:', error);
    return { success: false, error: error.message };
  }
}
