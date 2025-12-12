import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Mail, Send, Loader } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import ReportPDF from './ReportPDF';
import { ProgressData } from '../utils/progressTracker';

interface EmailReportModalProps {
  onClose: () => void;
  progress: ProgressData;
}

const EmailReportModal: React.FC<EmailReportModalProps> = ({ onClose, progress }) => {
  const [studentName, setStudentName] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentName.trim()) {
      setError('Please enter the student name');
      return;
    }

    setIsSending(true);
    setError('');

    try {
      // Generate PDF blob
      const blob = await pdf(<ReportPDF progress={progress} studentName={studentName} />).toBlob();
      
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      
      await new Promise<void>((resolve, reject) => {
        reader.onloadend = async () => {
          try {
            const base64data = reader.result as string;
            const base64Content = base64data.split(',')[1];

            // Send to Vercel serverless function (works both locally and in production)
            const response = await fetch('/api/send-report', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                studentName: studentName,
                pdfBase64: base64Content,
                reportDate: new Date().toLocaleDateString()
              }),
            });

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
              const text = await response.text();
              console.error('Non-JSON response:', text);
              throw new Error('Server error. Please check that RESEND_API_KEY is configured in Vercel.');
            }

            const result = await response.json();

            if (!response.ok || !result.success) {
              throw new Error(result.message || 'Failed to send email');
            }

            setSuccess(true);
            setTimeout(() => {
              onClose();
            }, 3000);
            resolve();
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
      });
    } catch (error) {
      console.error('Error sending email:', error);
      setError('Failed to send report. Please try again later.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={20} className="text-gray-600" />
        </button>

        {success ? (
          <div className="text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Send size={40} className="text-green-600" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Report Sent!</h3>
            <p className="text-gray-600">
              The report for {studentName} has been successfully sent to smumair2003@gmail.com
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={32} className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Report</h2>
              <p className="text-gray-600 text-sm">
                Enter the student's name to generate and email the report
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-2">
                  Student Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="studentName"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter student's full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={isSending}
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
                  disabled={isSending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSending}
                >
                  {isSending ? (
                    <>
                      <Loader size={20} className="animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      <span>Send Report</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Report will be sent to: <span className="font-semibold">smumair2003@gmail.com</span>
              </p>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default EmailReportModal;
