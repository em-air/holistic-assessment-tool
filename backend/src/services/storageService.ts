import { supabaseAdmin } from '../config/supabase.js';

const REPORTS_BUCKET = process.env.REPORTS_BUCKET || 'reports';

/**
 * Upload PDF to Supabase Storage
 */
export async function uploadPDF(
  userId: string,
  pdfBuffer: Buffer,
  reportType: string
): Promise<{ path: string; publicUrl: string } | null> {
  try {
    const timestamp = Date.now();
    const fileName = `${userId}/${timestamp}_${reportType}_report.pdf`;

    const { data, error } = await supabaseAdmin.storage
      .from(REPORTS_BUCKET)
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return null;
    }

    // Get public URL (or signed URL for private buckets)
    const { data: urlData } = supabaseAdmin.storage
      .from(REPORTS_BUCKET)
      .getPublicUrl(fileName);

    return {
      path: data.path,
      publicUrl: urlData.publicUrl,
    };
  } catch (error) {
    console.error('Storage service error:', error);
    return null;
  }
}

/**
 * Get signed URL for private file access (1 hour expiry)
 */
export async function getSignedUrl(filePath: string, expiresIn = 3600): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(REPORTS_BUCKET)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('Signed URL error:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Get signed URL error:', error);
    return null;
  }
}

/**
 * Delete PDF from storage
 */
export async function deletePDF(filePath: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.storage
      .from(REPORTS_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error('Storage delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete PDF error:', error);
    return false;
  }
}

/**
 * List all reports for a user
 */
export async function listUserReports(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(REPORTS_BUCKET)
      .list(userId);

    if (error) {
      console.error('List reports error:', error);
      return [];
    }

    return data.map(file => `${userId}/${file.name}`);
  } catch (error) {
    console.error('List user reports error:', error);
    return [];
  }
}
