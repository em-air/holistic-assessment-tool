import PDFDocument from 'pdfkit';
import type { Profile, QuizResult } from '../types/database.js';

export interface ReportData {
  profile: Profile;
  mindResults: QuizResult[];
  oralResults: QuizResult[];
  academicResults: QuizResult[];
  generatedAt: Date;
}

interface CategorySummary {
  completed: number;
  total: number;
  averageScore: number;
  subcategories: Record<string, { quizzes: QuizResult[]; averageScore: number }>;
}

// Color palette
const colors = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  gray: '#6b7280',
  lightGray: '#f3f4f6',
  dark: '#1f2937',
  white: '#ffffff',
};

/**
 * Get performance level based on percentage
 */
function getPerformanceLevel(percentage: number): { level: string; color: string } {
  if (percentage >= 90) return { level: 'Excellent', color: colors.success };
  if (percentage >= 75) return { level: 'Good', color: '#3b82f6' };
  if (percentage >= 60) return { level: 'Satisfactory', color: colors.warning };
  return { level: 'Needs Improvement', color: colors.danger };
}

/**
 * Generate recommendations based on results
 */
function generateRecommendations(
  mindResults: QuizResult[],
  oralResults: QuizResult[],
  academicResults: QuizResult[]
): { strengths: string[]; improvements: string[]; activities: string[] } {
  const strengths: string[] = [];
  const improvements: string[] = [];
  const activities: string[] = [];

  // Analyze mind results
  const attentionResults = mindResults.filter(r => r.subcategory === 'attention');
  const memoryResults = mindResults.filter(r => r.subcategory === 'memory');
  const criticalResults = mindResults.filter(r => r.subcategory === 'critical-thinking');

  if (attentionResults.length > 0) {
    const avgAttention = attentionResults.reduce((sum, r) => sum + r.percentage, 0) / attentionResults.length;
    if (avgAttention >= 75) {
      strengths.push('Strong attention and focus skills');
    } else if (avgAttention < 60) {
      improvements.push('Attention and focus skills need development');
      activities.push('Practice mindfulness exercises for 5-10 minutes daily');
    }
  }

  if (memoryResults.length > 0) {
    const avgMemory = memoryResults.reduce((sum, r) => sum + r.percentage, 0) / memoryResults.length;
    if (avgMemory >= 75) {
      strengths.push('Excellent memory and recall abilities');
    } else if (avgMemory < 60) {
      improvements.push('Memory skills could use strengthening');
      activities.push('Use memory games and flashcards for daily practice');
    }
  }

  if (criticalResults.length > 0) {
    const avgCritical = criticalResults.reduce((sum, r) => sum + r.percentage, 0) / criticalResults.length;
    if (avgCritical >= 75) {
      strengths.push('Strong critical thinking and problem-solving');
    } else if (avgCritical < 60) {
      improvements.push('Critical thinking skills need more practice');
      activities.push('Engage in puzzles, brain teasers, and logic games');
    }
  }

  // Analyze oral results
  if (oralResults.length > 0) {
    const avgOral = oralResults.reduce((sum, r) => sum + r.percentage, 0) / oralResults.length;
    if (avgOral >= 75) {
      strengths.push('Good oral language and communication skills');
    } else if (avgOral < 60) {
      improvements.push('Oral language skills need development');
      activities.push('Practice reading aloud and storytelling daily');
    }
  }

  // Analyze academic results
  if (academicResults.length > 0) {
    const avgAcademic = academicResults.reduce((sum, r) => sum + r.percentage, 0) / academicResults.length;
    if (avgAcademic >= 75) {
      strengths.push('Strong academic foundation');
    } else if (avgAcademic < 60) {
      improvements.push('Academic skills need reinforcement');
      activities.push('Regular reading and writing practice recommended');
    }
  }

  // Default recommendations if none generated
  if (strengths.length === 0) {
    strengths.push('Assessment in progress - complete more quizzes for detailed analysis');
  }
  if (improvements.length === 0 && (mindResults.length + oralResults.length + academicResults.length) > 0) {
    improvements.push('Continue practicing to maintain and improve skills');
  }
  if (activities.length === 0) {
    activities.push('Complete remaining assessments for personalized recommendations');
  }

  return { strengths, improvements, activities };
}

/**
 * Generate PDF report buffer
 */
export async function generateReportPDF(data: ReportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        info: {
          Title: `Assessment Report - ${data.profile.student_name || 'Student'}`,
          Author: 'Holistic Assessment Tool',
          Subject: 'Cognitive Skills Assessment Report',
        },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const pageWidth = doc.page.width - 100;
      let yPos = 50;

      // ============= PAGE 1: Cover & Summary =============
      
      // Header
      doc.fontSize(28).fillColor(colors.primary).text('Assessment Report', 50, yPos, { align: 'center' });
      yPos += 40;

      // Student info
      doc.fontSize(18).fillColor(colors.dark).text(data.profile.student_name || 'Student', 50, yPos, { align: 'center' });
      yPos += 25;
      
      if (data.profile.grade) {
        doc.fontSize(14).fillColor(colors.gray).text(data.profile.grade, 50, yPos, { align: 'center' });
        yPos += 20;
      }

      doc.fontSize(12).fillColor(colors.gray).text(
        `Generated: ${data.generatedAt.toLocaleDateString('en-US', { 
          year: 'numeric', month: 'long', day: 'numeric' 
        })}`,
        50, yPos, { align: 'center' }
      );
      yPos += 50;

      // Divider
      doc.moveTo(50, yPos).lineTo(pageWidth + 50, yPos).strokeColor(colors.lightGray).stroke();
      yPos += 30;

      // Summary Section
      doc.fontSize(16).fillColor(colors.dark).text('Assessment Summary', 50, yPos);
      yPos += 30;

      // Calculate overall stats
      const allResults = [...data.mindResults, ...data.oralResults, ...data.academicResults];
      const totalCompleted = allResults.length;
      const overallAverage = totalCompleted > 0
        ? Math.round(allResults.reduce((sum, r) => sum + r.percentage, 0) / totalCompleted)
        : 0;
      const totalTime = allResults.reduce((sum, r) => sum + (r.time_spent || 0), 0);

      // Summary boxes
      const boxWidth = (pageWidth - 30) / 4;
      const summaryItems = [
        { label: 'Quizzes Completed', value: totalCompleted.toString() },
        { label: 'Overall Score', value: `${overallAverage}%` },
        { label: 'Mind Skills', value: `${data.mindResults.length} completed` },
        { label: 'Time Invested', value: `${Math.round(totalTime / 60)} min` },
      ];

      summaryItems.forEach((item, index) => {
        const x = 50 + (index * (boxWidth + 10));
        doc.rect(x, yPos, boxWidth, 60).fillColor(colors.lightGray).fill();
        doc.fontSize(18).fillColor(colors.primary).text(item.value, x, yPos + 12, { width: boxWidth, align: 'center' });
        doc.fontSize(9).fillColor(colors.gray).text(item.label, x, yPos + 38, { width: boxWidth, align: 'center' });
      });
      yPos += 90;

      // Parent Note
      doc.rect(50, yPos, pageWidth, 80).fillColor('#f0f9ff').fill();
      doc.rect(50, yPos, 4, 80).fillColor(colors.primary).fill();
      doc.fontSize(11).fillColor(colors.dark).text(
        'Dear Parent/Guardian,\n\nThis report provides an overview of your child\'s cognitive skills assessment. ' +
        'The scores reflect performance across various cognitive areas including attention, memory, critical thinking, ' +
        'and language skills. Please review the recommendations section for suggested activities.',
        60, yPos + 12, { width: pageWidth - 20 }
      );
      yPos += 100;

      // Performance level indicator
      const performance = getPerformanceLevel(overallAverage);
      doc.fontSize(14).fillColor(colors.dark).text('Overall Performance: ', 50, yPos);
      doc.fontSize(14).fillColor(performance.color).text(performance.level, 180, yPos);
      yPos += 40;

      // ============= PAGE 2: Mind Skills =============
      doc.addPage();
      yPos = 50;

      doc.fontSize(20).fillColor(colors.primary).text('Mind Skills Assessment', 50, yPos);
      yPos += 35;

      const mindSubcategories: Record<string, QuizResult[]> = {};
      data.mindResults.forEach(r => {
        if (!mindSubcategories[r.subcategory]) {
          mindSubcategories[r.subcategory] = [];
        }
        mindSubcategories[r.subcategory].push(r);
      });

      const subcategoryNames: Record<string, string> = {
        'attention': 'Attention & Focus',
        'memory': 'Memory & Recall',
        'learning-style': 'Learning Style',
        'critical-thinking': 'Critical Thinking',
        'perception': 'Visual Perception',
      };

      for (const [subcategory, results] of Object.entries(mindSubcategories)) {
        if (yPos > 700) {
          doc.addPage();
          yPos = 50;
        }

        const avgScore = Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length);
        const perfLevel = getPerformanceLevel(avgScore);

        // Subcategory header
        doc.rect(50, yPos, pageWidth, 30).fillColor(colors.lightGray).fill();
        doc.fontSize(14).fillColor(colors.dark).text(
          subcategoryNames[subcategory] || subcategory, 
          60, yPos + 8
        );
        doc.fontSize(14).fillColor(perfLevel.color).text(`${avgScore}%`, pageWidth - 20, yPos + 8, { align: 'right' });
        yPos += 40;

        // Individual quiz results
        for (const result of results) {
          const quizPerf = getPerformanceLevel(result.percentage);
          doc.fontSize(11).fillColor(colors.dark).text(`• ${result.quiz_name}`, 70, yPos);
          doc.fontSize(11).fillColor(quizPerf.color).text(
            `${result.score}/${result.total_questions} (${result.percentage}%)`,
            pageWidth - 50, yPos, { align: 'right' }
          );
          yPos += 20;
        }
        yPos += 15;
      }

      // ============= PAGE 3: Oral Skills =============
      if (data.oralResults.length > 0) {
        doc.addPage();
        yPos = 50;

        doc.fontSize(20).fillColor(colors.secondary).text('Oral Skills Assessment', 50, yPos);
        yPos += 35;

        const oralSubcategories: Record<string, QuizResult[]> = {};
        data.oralResults.forEach(r => {
          if (!oralSubcategories[r.subcategory]) {
            oralSubcategories[r.subcategory] = [];
          }
          oralSubcategories[r.subcategory].push(r);
        });

        const oralNames: Record<string, string> = {
          'oral-language': 'Oral Language',
          'reading': 'Reading Skills',
          'phonics': 'Phonics Awareness',
          'blending-segmenting': 'Blending & Segmenting',
        };

        for (const [subcategory, results] of Object.entries(oralSubcategories)) {
          if (yPos > 700) {
            doc.addPage();
            yPos = 50;
          }

          const avgScore = Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length);
          const perfLevel = getPerformanceLevel(avgScore);

          doc.rect(50, yPos, pageWidth, 30).fillColor(colors.lightGray).fill();
          doc.fontSize(14).fillColor(colors.dark).text(oralNames[subcategory] || subcategory, 60, yPos + 8);
          doc.fontSize(14).fillColor(perfLevel.color).text(`${avgScore}%`, pageWidth - 20, yPos + 8, { align: 'right' });
          yPos += 40;

          for (const result of results) {
            const quizPerf = getPerformanceLevel(result.percentage);
            doc.fontSize(11).fillColor(colors.dark).text(`• ${result.quiz_name}`, 70, yPos);
            doc.fontSize(11).fillColor(quizPerf.color).text(
              `${result.score}/${result.total_questions} (${result.percentage}%)`,
              pageWidth - 50, yPos, { align: 'right' }
            );
            yPos += 20;
          }
          yPos += 15;
        }
      }

      // ============= PAGE 4: Academic Skills =============
      if (data.academicResults.length > 0) {
        doc.addPage();
        yPos = 50;

        doc.fontSize(20).fillColor('#059669').text('Academic Skills Assessment', 50, yPos);
        yPos += 35;

        const academicSubcategories: Record<string, QuizResult[]> = {};
        data.academicResults.forEach(r => {
          if (!academicSubcategories[r.subcategory]) {
            academicSubcategories[r.subcategory] = [];
          }
          academicSubcategories[r.subcategory].push(r);
        });

        const academicNames: Record<string, string> = {
          'writing': 'Writing Skills',
          'vocabulary': 'Vocabulary',
          'spelling': 'Spelling',
        };

        for (const [subcategory, results] of Object.entries(academicSubcategories)) {
          if (yPos > 700) {
            doc.addPage();
            yPos = 50;
          }

          const avgScore = Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length);
          const perfLevel = getPerformanceLevel(avgScore);

          doc.rect(50, yPos, pageWidth, 30).fillColor(colors.lightGray).fill();
          doc.fontSize(14).fillColor(colors.dark).text(academicNames[subcategory] || subcategory, 60, yPos + 8);
          doc.fontSize(14).fillColor(perfLevel.color).text(`${avgScore}%`, pageWidth - 20, yPos + 8, { align: 'right' });
          yPos += 40;

          for (const result of results) {
            const quizPerf = getPerformanceLevel(result.percentage);
            doc.fontSize(11).fillColor(colors.dark).text(`• ${result.quiz_name}`, 70, yPos);
            doc.fontSize(11).fillColor(quizPerf.color).text(
              `${result.score}/${result.total_questions} (${result.percentage}%)`,
              pageWidth - 50, yPos, { align: 'right' }
            );
            yPos += 20;
          }
          yPos += 15;
        }
      }

      // ============= FINAL PAGE: Recommendations =============
      doc.addPage();
      yPos = 50;

      doc.fontSize(20).fillColor(colors.success).text('Recommendations', 50, yPos);
      yPos += 35;

      const recommendations = generateRecommendations(
        data.mindResults,
        data.oralResults,
        data.academicResults
      );

      // Strengths
      doc.rect(50, yPos, pageWidth, 25).fillColor('#f0fdf4').fill();
      doc.fontSize(14).fillColor('#166534').text('💪 Strengths Identified', 60, yPos + 6);
      yPos += 35;

      for (const strength of recommendations.strengths) {
        doc.fontSize(11).fillColor(colors.dark).text(`• ${strength}`, 70, yPos);
        yPos += 20;
      }
      yPos += 15;

      // Areas for Improvement
      doc.rect(50, yPos, pageWidth, 25).fillColor('#fef3c7').fill();
      doc.fontSize(14).fillColor('#92400e').text('📈 Areas for Growth', 60, yPos + 6);
      yPos += 35;

      for (const improvement of recommendations.improvements) {
        doc.fontSize(11).fillColor(colors.dark).text(`• ${improvement}`, 70, yPos);
        yPos += 20;
      }
      yPos += 15;

      // Suggested Activities
      doc.rect(50, yPos, pageWidth, 25).fillColor('#dbeafe').fill();
      doc.fontSize(14).fillColor('#1e40af').text('🎯 Suggested Activities', 60, yPos + 6);
      yPos += 35;

      for (const activity of recommendations.activities) {
        doc.fontSize(11).fillColor(colors.dark).text(`• ${activity}`, 70, yPos);
        yPos += 20;
      }
      yPos += 30;

      // Footer with watermark
      doc.fontSize(10).fillColor(colors.gray).text(
        'Generated by Holistic Assessment Tool | Bloom Tutoring',
        50, doc.page.height - 50, { align: 'center', width: pageWidth }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
