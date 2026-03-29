import { supabase } from '../supabase-client';
import { logger } from '../utils/logger';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface GenerateReportResponse {
  success: boolean;
  report?: {
    id: string;
    user_id: string;
    report_type: string;
    pdf_url: string;
    created_at: string;
  };
  downloadUrl?: string;
  downloadUrlAr?: string;
  error?: string;
}

/**
 * Get the current user's access token for API calls
 */
async function getAccessToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

/**
 * Generate a report via the backend API
 */
export async function generateReport(options: {
  reportType?: 'mind' | 'oral' | 'academic' | 'full';
}): Promise<GenerateReportResponse> {
  try {
    const token = await getAccessToken();
    if (!token) {
      return { success: false, error: 'Not authenticated. Please sign in.' };
    }

    const response = await fetch(`${API_BASE_URL}/api/reports/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        report_type: options.reportType || 'full',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        success: false, 
        error: errorData.error || `Server error: ${response.status}` 
      };
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    logger.error('Generate report error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to connect to server' 
    };
  }
}

/**
 * Get list of user's previous reports
 */
export async function getReportHistory(): Promise<{
  success: boolean;
  reports?: any[];
  error?: string;
}> {
  try {
    const token = await getAccessToken();
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(`${API_BASE_URL}/api/reports`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        success: false, 
        error: errorData.error || 'Failed to fetch reports' 
      };
    }

    const data = await response.json();
    return { success: true, reports: data.reports };
  } catch (error: any) {
    logger.error('Get reports error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Download a specific report
 */
export async function downloadReport(reportId: string): Promise<{
  success: boolean;
  downloadUrl?: string;
  error?: string;
}> {
  try {
    const token = await getAccessToken();
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        success: false, 
        error: errorData.error || 'Failed to get download link' 
      };
    }

    const data = await response.json();
    return { success: true, downloadUrl: data.downloadUrl };
  } catch (error: any) {
    logger.error('Download report error:', error);
    return { success: false, error: error.message };
  }
}
