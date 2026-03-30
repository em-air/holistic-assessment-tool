/**
 * Profile Service
 * Fetches student-specific data: reports and profile info via the API.
 */

import { api } from './apiClient';

export interface ProfileReport {
  id: string;
  report_type: 'mind' | 'oral' | 'academic' | 'full';
  pdf_url: string;
  generated_at: string;
  emailed_to: string[] | null;
}

export interface ProfileReportsResponse {
  success: boolean;
  reports: ProfileReport[];
  count: number;
}

/**
 * Fetch all reports for the currently authenticated student.
 */
export async function getMyReports(): Promise<{ success: boolean; reports: ProfileReport[]; error?: string }> {
  try {
    const response = await api.get<ProfileReportsResponse>('/api/reports');
    if (!response.success || !response.data) {
      return { success: false, reports: [], error: response.error?.message || 'Failed to load reports' };
    }
    const data = response.data as unknown as ProfileReportsResponse;
    return { success: true, reports: data.reports ?? [] };
  } catch (error) {
    return { success: false, reports: [], error: 'Failed to load reports' };
  }
}

/**
 * Download a report PDF by its ID.
 * Uses the backend's signed URL endpoint, then opens the link.
 */
export async function downloadReport(reportId: string): Promise<{ success: boolean; url?: string; filename?: string; error?: string }> {
  try {
    const response = await api.get<{ downloadUrl: string; expiresIn: number }>(`/api/reports/${reportId}/download`);
    if (!response.success || !response.data) {
      return { success: false, error: response.error?.message || 'Download failed' };
    }

    const data = response.data as unknown as { downloadUrl: string };
    return { success: true, url: data.downloadUrl, filename: `report-${reportId}.pdf` };
  } catch (error) {
    return { success: false, error: 'Download failed' };
  }
}
