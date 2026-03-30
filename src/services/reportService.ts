import { api } from './apiClient';
import { logger } from '../utils/logger';

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
 * Generate a report via the backend API
 */
export async function generateReport(options: {
  reportType?: 'mind' | 'oral' | 'academic' | 'full';
}): Promise<GenerateReportResponse> {
  try {
    const response = await api.post<GenerateReportResponse>('/api/reports/generate', {
      report_type: options.reportType || 'full',
    });

    if (!response.success) {
      return { 
        success: false, 
        error: response.error?.message || 'Failed to generate report' 
      };
    }

    return response.data ?? { success: false, error: 'Empty response' };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error('Generate report error:', error);
    return { 
      success: false, 
      error: msg || 'Failed to connect to server' 
    };
  }
}

interface ReportHistoryItem {
  id: string;
  report_type: string;
  pdf_url: string;
  created_at: string;
}

/**
 * Get list of user's previous reports
 */
export async function getReportHistory(): Promise<{
  success: boolean;
  reports?: ReportHistoryItem[];
  error?: string;
}> {
  try {
    const response = await api.get<{ reports: ReportHistoryItem[] }>('/api/reports');

    if (!response.success) {
      return { 
        success: false, 
        error: response.error?.message || 'Failed to fetch reports' 
      };
    }

    return { success: true, reports: response.data?.reports };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error('Get reports error:', error);
    return { success: false, error: msg };
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
    const response = await api.get<{ downloadUrl: string }>(`/api/reports/${encodeURIComponent(reportId)}/download`);

    if (!response.success) {
      return { 
        success: false, 
        error: response.error?.message || 'Failed to get download link' 
      };
    }

    return { success: true, downloadUrl: response.data?.downloadUrl };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error('Download report error:', error);
    return { success: false, error: msg };
  }
}
