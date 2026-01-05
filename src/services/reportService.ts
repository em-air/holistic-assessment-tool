import { supabase } from '../supabase-client';

interface GenerateReportResponse {
  success: boolean;
  report?: {
    id: string;
    user_id: string;
    report_type: string;
    created_at: string;
  };
  error?: string;
}

interface SendEmailResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Get the current user
 */
async function getCurrentUser(): Promise<{ id: string; email?: string } | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
}

/**
 * Save a report record to Supabase (PDF is generated in browser)
 * This just creates a record in the database for tracking
 */
export async function generateReport(options: {
  reportType?: 'mind' | 'oral' | 'academic' | 'full';
  sendEmail?: boolean;
  emailRecipients?: string[];
}): Promise<GenerateReportResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated. Please sign in.' };
    }

    // Create a report record in Supabase
    const { data, error } = await supabase
      .from('reports')
      .insert({
        user_id: user.id,
        report_type: options.reportType || 'full',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      // If table doesn't exist or there's an error, just log it but don't fail
      // The PDF is generated in browser anyway
      console.log('Report record creation skipped:', error.message);
      return { 
        success: true, 
        report: {
          id: crypto.randomUUID(),
          user_id: user.id,
          report_type: options.reportType || 'full',
          created_at: new Date().toISOString(),
        }
      };
    }

    return { success: true, report: data };
  } catch (error: any) {
    console.error('Generate report error:', error);
    // Don't fail - PDF generation happens in browser
    return { success: true };
  }
}

/**
 * Send a text-only email report using Vercel serverless function
 */
export async function sendTextReport(options: {
  studentName: string;
  recipientEmail: string;
  reportSummary?: {
    mindScore?: number;
    oralScore?: number;
    academicScore?: number;
    totalQuizzes?: number;
  };
}): Promise<SendEmailResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated. Please sign in.' };
    }

    // Build HTML email content
    const summary = options.reportSummary || {};
    const htmlContent = `
      <h2>Cognitive Skills Assessment Report</h2>
      <p>Hello,</p>
      <p>Here is the assessment summary for <strong>${options.studentName}</strong>:</p>
      
      <table style="border-collapse: collapse; margin: 20px 0;">
        <tr style="background: #f4f4f4;">
          <th style="padding: 10px; border: 1px solid #ddd;">Category</th>
          <th style="padding: 10px; border: 1px solid #ddd;">Score</th>
        </tr>
        ${summary.mindScore !== undefined ? `<tr><td style="padding: 10px; border: 1px solid #ddd;">Mind Skills</td><td style="padding: 10px; border: 1px solid #ddd;">${summary.mindScore}%</td></tr>` : ''}
        ${summary.oralScore !== undefined ? `<tr><td style="padding: 10px; border: 1px solid #ddd;">Oral Language</td><td style="padding: 10px; border: 1px solid #ddd;">${summary.oralScore}%</td></tr>` : ''}
        ${summary.academicScore !== undefined ? `<tr><td style="padding: 10px; border: 1px solid #ddd;">Academic Skills</td><td style="padding: 10px; border: 1px solid #ddd;">${summary.academicScore}%</td></tr>` : ''}
      </table>
      
      <p>Total Quizzes Completed: ${summary.totalQuizzes || 0}</p>
      <p>Date: ${new Date().toLocaleDateString()}</p>
      
      <p style="margin-top: 20px;">Best regards,<br>Assessment System</p>
    `;

    // Use Vercel serverless function (or Supabase Edge Function if configured)
    // For now, we'll call the existing /api/send-report endpoint
    const response = await fetch('/api/send-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentName: options.studentName,
        recipientEmail: options.recipientEmail,
        htmlContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        success: false, 
        error: errorData.message || `Server error: ${response.status}` 
      };
    }

    const data = await response.json();
    return { success: true, message: data.message || 'Email sent successfully' };
  } catch (error: any) {
    console.error('Send email error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send email' 
    };
  }
}

/**
 * Get list of user's previous reports from Supabase
 */
export async function getReportHistory(): Promise<{
  success: boolean;
  reports?: any[];
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, reports: data || [] };
  } catch (error: any) {
    console.error('Get reports error:', error);
    return { success: false, error: error.message };
  }
}
