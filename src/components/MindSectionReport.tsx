import React from 'react';
import { motion } from 'framer-motion';
import { X, Download, Share2, Brain, Award, Database, CheckCircle, LogIn } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { ProgressTracker, MIND_QUIZZES, ORAL_QUIZZES, ALL_TRACKED_QUIZZES, QuizResult } from '../utils/progressTracker';
import { ReportPDFEnglish, ReportPDFArabic } from './ReportPDF';

import { generateReport } from '../services/reportService';
import { useNavigate } from 'react-router-dom';
import { logger } from '../utils/logger';
import { ROUTES } from '../routes';

interface MindSectionReportProps {
  onClose: () => void;
}

const MindSectionReport: React.FC<MindSectionReportProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);
  const [isSavingToDatabase, setIsSavingToDatabase] = React.useState(false);
  const [savedToDatabase, setSavedToDatabase] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  
  const isAuthenticated = ProgressTracker.isAuthenticated();
  const progress = ProgressTracker.getProgress();
  // Deduplicate results by quizId (keep latest by completedAt)
  const allResults = [...progress.mindSectionResults, ...(progress.oralSectionResults ?? []), ...(progress.academicSectionResults ?? [])];
  const resultMap = new Map<string, QuizResult>();
  for (const r of allResults) {
    const existing = resultMap.get(r.quizId);
    if (!existing || new Date(r.completedAt) > new Date(existing.completedAt)) {
      resultMap.set(r.quizId, r);
    }
  }
  const results = Array.from(resultMap.values());

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
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
          className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center"
          onClick={e => e.stopPropagation()}
        >
          <LogIn size={48} className="mx-auto mb-4 text-purple-500" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Sign In Required</h2>
          <p className="text-gray-600 mb-6">
            You need to sign in to view your assessment report. Your progress is saved to your account.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => navigate(ROUTES.AUTH)}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg"
            >
              Sign In
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Calculate statistics
  const averageScore = results.length > 0 
    ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
    : 0;
  
  const totalTimeSpent = results.reduce((sum, r) => sum + (r.timeSpent || 0), 0);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const getSubcategoryName = (subcategory: string): string => {
    const names: Record<string, string> = {
      'attention': 'Attention',
      'memory': 'Memory',
      'learning-style': 'Learning Style',
      'critical-thinking': 'Critical Thinking',
      'perception': 'Perception',
      'oral-language': 'Oral Language',
      'phonics': 'Beginning & Ending Sounds',
      'blending-segmenting': 'Blending & Segmenting',
      'spelling': 'Spelling',
      'writing': 'Writing',
      'vocabulary': 'Vocabulary'
    };
    return names[subcategory] || subcategory;
  };

  const getCategoryColor = (subcategory: string): string => {
    const colors: Record<string, string> = {
      'attention': 'text-yellow-600',
      'memory': 'text-orange-600',
      'learning-style': 'text-green-600',
      'critical-thinking': 'text-purple-600',
      'perception': 'text-indigo-600',
      'oral-language': 'text-sky-600',
      'phonics': 'text-pink-600',
      'blending-segmenting': 'text-teal-600',
      'spelling': 'text-violet-600',
      'writing': 'text-amber-600',
      'vocabulary': 'text-rose-600'
    };
    return colors[subcategory] || 'text-gray-600';
  };

  const remapQuizCategory = (result: QuizResult): string => {
    // Remap certain quizzes to correct categories based on user specification
    if (result.quizId === 'memory-assessment' || result.quizId === 'memory-quiz') {
      return 'memory';
    }
    if (result.quizId === 'attention-assessment') {
      return 'attention';
    }
    return result.subcategory;
  };

  const getSkillDescription = (subcategory: string): string => {
    const descriptions: Record<string, string> = {
      'attention': 'Attention skills involve the ability to focus on tasks and filter out distractions effectively. These skills are fundamental for learning and academic success.',
      'memory': 'Memory skills encompass the ability to retain, recall, and work with information over different time periods. This includes both short-term and long-term memory functions.',
      'learning-style': 'Learning Styles refer to how your child best receives, processes, and retains information. Understanding their preferred learning style helps optimize their educational experience.',
      'critical-thinking': 'Critical Thinking encompasses reasoning, problem-solving, and analytical skills. It includes the ability to make connections, recognize patterns, and think logically about relationships between concepts.',
      'perception': 'Perception involves how your child interprets and understands visual and spatial information. This includes recognizing patterns, understanding spatial relationships, and processing visual details.',
      'oral-language': 'Oral Language skills measure vocabulary breadth, sentence construction, story sequencing, and narrative retelling abilities essential for communication and literacy development.',
      'phonics': 'Phonics skills assess the ability to identify letter-sound relationships, recognize beginning and ending sounds, and decode words — foundational skills for reading.',
      'blending-segmenting': 'Blending and Segmenting skills measure the ability to combine individual sounds into words (blending) and break words into component sounds (segmenting), both critical for reading fluency.',
      'spelling': 'Spelling skills measure the ability to correctly write words, demonstrating phonetic knowledge and orthographic awareness.',
      'writing': 'Writing skills assess the ability to compose text with proper structure, grammar, vocabulary usage, and creative expression.',
      'vocabulary': 'Vocabulary skills measure word knowledge, including understanding word meanings and the ability to match words with their definitions.'
    };
    return descriptions[subcategory] || 'This skill area measures important cognitive abilities.';
  };

  const getDetailedAnalysis = (result: QuizResult): string => {
    const category = remapQuizCategory(result);
    
    let analysis = '';
    
    if (category === 'attention') {
      if (result.percentage >= 90) {
        analysis = 'Your child demonstrates excellent attention capabilities. They can focus well on tasks and maintain concentration effectively. This is a strong foundation for academic learning.';
      } else if (result.percentage >= 75) {
        analysis = 'Your child shows good attention skills. They generally focus well with some areas for continued development.';
      } else if (result.percentage >= 60) {
        analysis = 'Your child has developing attention skills. Consider activities that help improve focus and concentration to support their learning.';
      } else {
        analysis = 'Your child may benefit from additional support in developing attention skills. Simple focusing exercises and structured activities can be helpful.';
      }
    } else if (category === 'memory') {
      // Special handling for Memory Quiz with additional data
      if (result.quizId === 'memory-quiz' && result.additionalData) {
        const { levelsCompleted, endReason, attemptsPerLevel } = result.additionalData;
        const totalAttempts = Object.values(attemptsPerLevel || {}).reduce((sum: number, attempts: any) => sum + attempts, 0);
        
        if (endReason === 'out-of-tries') {
          analysis = `Your child completed ${levelsCompleted} out of 6 memory levels before running out of attempts. They made ${totalAttempts} total attempts, showing persistence. Memory games require practice - encourage them to try again as repetition improves memory skills.`;
        } else if (result.percentage >= 90) {
          analysis = `Excellent memory performance! Your child completed all 6 levels with ${totalAttempts} total attempts. They demonstrate strong visual memory and pattern recognition skills.`;
        } else if (result.percentage >= 75) {
          analysis = `Good memory skills shown. Your child completed the memory challenge with ${totalAttempts} attempts, displaying solid visual memory abilities with room for improvement.`;
        } else {
          analysis = `Your child shows developing memory skills. They made ${totalAttempts} attempts across ${levelsCompleted} levels. Regular practice with memory games can strengthen these important cognitive abilities.`;
        }
      } else {
        // Standard memory analysis
        if (result.percentage >= 90) {
          analysis = 'Your child demonstrates excellent memory capabilities. They can retain and recall information effectively. This is a strong foundation for academic learning.';
        } else if (result.percentage >= 75) {
          analysis = 'Your child shows good memory skills. They generally retain information well, with some areas for continued development.';
        } else if (result.percentage >= 60) {
          analysis = 'Your child has developing memory skills. Consider activities that help improve memory techniques to support their learning.';
        } else {
          analysis = 'Your child may benefit from additional support in developing memory skills. Memory games and exercises can be helpful.';
        }
      }
    } else if (category === 'learning-style') {
      // For learning style, provide specific guidance based on the identified style
      if (result.additionalData?.dominantStyle) {
        const style = result.additionalData.dominantStyle;
        const styleDescriptions: Record<string, string> = {
          'visual': 'Your child is a Visual Learner. They learn best through seeing and visualizing information. Use diagrams, charts, color-coded notes, videos, and visual aids to help them understand and remember concepts. Mind maps and flashcards are particularly effective.',
          'auditory': 'Your child is an Auditory Learner. They learn best through listening and discussion. Encourage reading aloud, verbal explanations, group discussions, and audio resources. They may benefit from recording lessons to listen to later.',
          'reading-writing': 'Your child is a Reading/Writing Learner. They learn best through written words. Encourage note-taking, reading textbooks, writing summaries, and making lists. Written exercises and journaling can enhance their learning.',
          'kinesthetic': 'Your child is a Kinesthetic Learner. They learn best through hands-on activities and movement. Use physical activities, experiments, role-playing, and real-world applications. Short study sessions with movement breaks work well.'
        };
        analysis = styleDescriptions[style] || `Your child shows a preference for ${style} learning. Adapt teaching methods to match this style for optimal results.`;
      } else {
        analysis = 'Your child is still discovering their optimal learning style. Exposing them to different learning methods will help identify what works best for them.';
      }
    } else if (category === 'critical-thinking') {
      if (result.percentage >= 90) {
        analysis = 'Your child excels in critical thinking and reasoning. They can make connections, solve problems, and think logically about complex relationships.';
      } else if (result.percentage >= 75) {
        analysis = 'Your child demonstrates solid critical thinking abilities. They can reason through problems and make logical connections most of the time.';
      } else if (result.percentage >= 60) {
        analysis = 'Your child is developing their critical thinking skills. Encourage them to ask questions and think through problems step by step.';
      } else {
        analysis = 'Your child would benefit from activities that build reasoning and problem-solving skills. Puzzles, games, and guided discussions can help.';
      }
    } else if (category === 'perception') {
      if (result.percentage >= 90) {
        analysis = 'Your child has excellent visual and spatial perception skills. They can accurately interpret visual information and understand spatial relationships.';
      } else if (result.percentage >= 75) {
        analysis = 'Your child shows good visual perception abilities. They generally process visual information well with some areas for continued growth.';
      } else if (result.percentage >= 60) {
        analysis = 'Your child is developing their visual perception skills. Activities involving visual patterns and spatial relationships can be beneficial.';
      } else {
        analysis = 'Your child may benefit from activities that strengthen visual processing skills, such as puzzles, drawing, and pattern recognition games.';
      }
    }
    
    return analysis;
  };

  // Save report to database via backend API
  const saveReportToDatabase = async (): Promise<void> => {
    try {
      setIsSavingToDatabase(true);
      setSaveError(null);
      
      const result = await generateReport({
        reportType: 'full',
      });
      
      if (result.success) {
        setSavedToDatabase(true);
        logger.log('Report saved to database:', result.report?.id);
      } else {
        setSaveError(result.error || 'Failed to save report');
      }
    } catch (error: any) {
      logger.error('Error saving report to database:', error);
      setSaveError(error.message || 'Failed to save report');
    } finally {
      setIsSavingToDatabase(false);
    }
  };

  const exportReport = async (): Promise<void> => {
    try {
      setIsGeneratingPDF(true);
      
      // Also save to database when exporting
      saveReportToDatabase();
      
      const isCompleteReport = progress.overallProgress === 100;
      const dateSuffix = new Date().toISOString().split('T')[0];
      const partialSuffix = isCompleteReport ? '' : '-partial';

      // Generate English PDF
      const enBlob = await pdf(<ReportPDFEnglish progress={progress} studentName={undefined} />).toBlob();
      const enUrl = URL.createObjectURL(enBlob);
      const enLink = document.createElement('a');
      enLink.href = enUrl;
      enLink.download = `en_cognitive-skills-report${partialSuffix}-${dateSuffix}.pdf`;
      document.body.appendChild(enLink);
      enLink.click();
      document.body.removeChild(enLink);
      URL.revokeObjectURL(enUrl);

      // Generate Arabic PDF
      const arBlob = await pdf(<ReportPDFArabic progress={progress} studentName={undefined} />).toBlob();
      const arUrl = URL.createObjectURL(arBlob);
      const arLink = document.createElement('a');
      arLink.href = arUrl;
      arLink.download = `ar_cognitive-skills-report${partialSuffix}-${dateSuffix}.pdf`;
      document.body.appendChild(arLink);
      arLink.click();
      document.body.removeChild(arLink);
      URL.revokeObjectURL(arUrl);
    } catch (error) {
      logger.error('Error generating PDF:', error);
      // Fallback to text export if PDF generation fails
      exportTextReport();
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const exportTextReport = (): void => {
    const date = new Date().toLocaleDateString();
    const isCompleteReport = progress.overallProgress === 100;
    let reportText = `HOLISTIC SKILLS ASSESSMENT REPORT${isCompleteReport ? '' : ' (PARTIAL)'}
Generated: ${date}

================================
ASSESSMENT SUMMARY
================================

Overall Progress: ${progress.overallProgress}% (${results.length}/${ALL_TRACKED_QUIZZES.length} assessments completed)
Average Score: ${averageScore}%
Total Time Invested: ${formatTime(totalTimeSpent)}

Dear Parent,
This ${isCompleteReport ? 'comprehensive' : 'partial'} report provides an overview of your child's performance across key cognitive skill areas.

================================
DETAILED SKILL ANALYSIS
================================

`;

    // Group results by skill category
    ['attention', 'memory', 'learning-style', 'critical-thinking', 'perception', 'oral-language', 'phonics', 'phonics-awareness', 'blending-segmenting'].forEach(category => {
      const categoryResults = results.filter(r => remapQuizCategory(r) === category);
      if (categoryResults.length === 0) return;
      
      const categoryAverage = Math.round(
        categoryResults.reduce((sum, r) => sum + r.percentage, 0) / categoryResults.length
      );
      
      reportText += `${getSubcategoryName(category).toUpperCase()} - Average: ${categoryAverage}%
${'-'.repeat(50)}

Assessment Results:
`;
      
      categoryResults.forEach(result => {
        const performance = ProgressTracker.getPerformanceLevel(result.percentage);
        const isLS = result.quizId === 'learning-styles' && result.additionalData?.dominantStyle;
        const isAttn = result.quizId === 'attention-assessment';
        const scoreDisplay = isLS
          ? `Style: ${result.additionalData.dominantStyle === 'visual' ? 'Visual Learner' : result.additionalData.dominantStyle === 'auditory' ? 'Auditory Learner' : result.additionalData.dominantStyle === 'kinesthetic' ? 'Kinesthetic Learner' : 'Reading/Writing Learner'}`
          : isAttn
            ? `Attention Level: ${result.additionalData?.attentionLevel || (result.percentage >= 75 ? 'Strong Focus' : result.percentage >= 60 ? 'Moderate Focus' : 'Developing Focus')}`
            : `Score: ${result.score}/${result.totalQuestions} (${result.percentage}%)`;
        reportText += `
\u2022 ${result.quizName} (${getSubcategoryName(category)})
  ${scoreDisplay}
  Performance Level: ${performance.level}
  Analysis: ${getDetailedAnalysis(result)}

`;
      });
      
      reportText += '\n';
    });

    const dataBlob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `cognitive-skills-report-fallback-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const printReport = (): void => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center space-x-2">
                <Brain size={28} />
                <span>Cognition Section Report</span>
                {progress.overallProgress < 100 && (
                  <span className="text-sm bg-yellow-500 text-white px-2 py-1 rounded-full">Partial</span>
                )}
              </h2>
              <p className="text-purple-100 mt-1">
                {progress.overallProgress === 100 ? 'Complete' : 'Progress'} assessment overview • Generated {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={saveReportToDatabase}
                disabled={isSavingToDatabase || savedToDatabase}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  savedToDatabase
                    ? 'bg-green-500/30 cursor-default'
                    : isSavingToDatabase 
                      ? 'bg-white/10 cursor-not-allowed' 
                      : 'bg-white/20 hover:bg-white/30'
                }`}
                title={savedToDatabase ? "Saved to Database" : isSavingToDatabase ? "Saving..." : "Save Report to Database"}
              >
                {savedToDatabase ? (
                  <CheckCircle size={20} className="text-green-200" />
                ) : isSavingToDatabase ? (
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <Database size={20} />
                )}
              </button>
              <button
                onClick={exportReport}
                disabled={isGeneratingPDF}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  isGeneratingPDF 
                    ? 'bg-white/10 cursor-not-allowed' 
                    : 'bg-white/20 hover:bg-white/30'
                }`}
                title={isGeneratingPDF ? "Generating PDF..." : "Download PDF Report"}
              >
                {isGeneratingPDF ? (
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <Download size={20} />
                )}
              </button>
              <button
                onClick={printReport}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors duration-200"
                title="Print Report"
              >
                <Share2 size={20} />
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Report Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Cognitive Skills Assessment Report</h3>
          <p className="text-sm text-gray-600 mt-1">A comprehensive overview of your child's performance across key cognitive areas</p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* Overall Summary */}
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Assessment Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{progress.overallProgress}%</div>
                <div className="text-sm text-blue-700">Assessments Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{averageScore}%</div>
                <div className="text-sm text-green-700">Overall Average Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{results.length}</div>
                <div className="text-sm text-orange-700">Skills Areas Assessed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{formatTime(totalTimeSpent)}</div>
                <div className="text-sm text-purple-700">Total Time Invested</div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-gray-700 leading-relaxed">
                <strong>Dear Parent,</strong> This report provides an overview of your child's performance across key cognitive skill areas. 
                Each section below explains what skills were tested and how your child performed, along with suggestions for continued development. 
                {progress.overallProgress === 100 
                  ? `The assessment covers all ${ALL_TRACKED_QUIZZES.length} areas that are fundamental to learning and academic success.`
                  : `Your child has completed ${results.length} out of ${ALL_TRACKED_QUIZZES.length} assessments so far. You can continue taking additional assessments to get a more complete picture.`
                }
              </p>
            </div>
          </div>

          {/* Skill-by-Skill Breakdown */}
          <div className="space-y-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">🧠 Detailed Skill Analysis</h3>
            
            {/* Group results by skill category */}
            {['attention', 'memory', 'learning-style', 'critical-thinking', 'perception', 'oral-language', 'phonics', 'blending-segmenting', 'spelling', 'writing', 'vocabulary'].map(category => {
              const categoryResults = results.filter(r => remapQuizCategory(r) === category);
              if (categoryResults.length === 0) return null;
              
              const categoryAverage = Math.round(
                categoryResults.reduce((sum, r) => sum + r.percentage, 0) / categoryResults.length
              );
              
              return (
                <div key={category} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`text-lg font-bold ${getCategoryColor(category)}`}>{getSubcategoryName(category)}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Category Average:</span>
                        <span className={`font-bold text-lg ${getCategoryColor(category)}`}>
                          {categoryAverage}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <h5 className="font-semibold text-gray-700 mb-2">What this skill area measures:</h5>
                      <p className="text-gray-600 text-sm leading-relaxed">{getSkillDescription(category)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {categoryResults.map((result) => {
                      const performance = ProgressTracker.getPerformanceLevel(result.percentage);
                      const performanceText = result.percentage >= 90 ? 'Excellent' : 
                                            result.percentage >= 75 ? 'Good' : 
                                            result.percentage >= 60 ? 'Developing' : 'Needs Support';
                      
                      // For learning style, show the dominant style type instead of percentage
                      const isLearningStyle = result.quizId === 'learning-styles';
                      const learnerType = isLearningStyle && result.additionalData?.dominantStyle
                        ? result.additionalData.dominantStyle === 'visual' ? 'Visual Learner'
                          : result.additionalData.dominantStyle === 'auditory' ? 'Auditory Learner'
                          : result.additionalData.dominantStyle === 'reading-writing' ? 'Reading/Writing Learner'
                          : result.additionalData.dominantStyle === 'kinesthetic' ? 'Kinesthetic Learner'
                          : result.additionalData.dominantStyle.charAt(0).toUpperCase() + result.additionalData.dominantStyle.slice(1) + ' Learner'
                        : null;

                      // For attention assessment, show qualitative level
                      const isAttention = result.quizId === 'attention-assessment';
                      const attentionLevel = isAttention
                        ? (result.additionalData?.attentionLevel || (result.percentage >= 75 ? 'Strong Focus' : result.percentage >= 60 ? 'Moderate Focus' : 'Developing Focus'))
                        : null;
                      
                      return (
                        <div key={`${category}-${result.quizId}`} className={`border-l-4 pl-4 ${getCategoryColor(category).replace('text-', 'border-')}`}>
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h5 className="font-semibold text-gray-800">{result.quizName} <span className="text-gray-500 font-normal">({getSubcategoryName(category)})</span></h5>
                              {result.gradeLevel && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mt-1 inline-block">
                                  Grade {result.gradeLevel}
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              {isLearningStyle && learnerType ? (
                                <>
                                  <div className={`text-lg font-bold ${getCategoryColor(category)}`}>
                                    {learnerType}
                                  </div>
                                  <div className="text-sm text-gray-500">Learning Style Identified</div>
                                </>
                              ) : isAttention && attentionLevel ? (
                                <>
                                  <div className={`text-lg font-bold ${getCategoryColor(category)}`}>
                                    {attentionLevel}
                                  </div>
                                  <div className="text-sm text-gray-500">Attention Level</div>
                                </>
                              ) : (
                                <>
                                  <div className={`text-xl font-bold ${getCategoryColor(category)} flex items-center space-x-1`}>
                                    <span>{result.percentage}%</span>
                                  </div>
                                  <div className="text-sm text-gray-500">Performance: {performanceText}</div>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <div className="bg-blue-50 p-4 rounded-lg mb-3">
                            <h6 className="font-medium text-blue-900 mb-2">Performance Analysis:</h6>
                            <p className="text-blue-800 text-sm leading-relaxed">{getDetailedAnalysis(result)}</p>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
                            <div>
                              <span className="font-medium">Time Spent:</span> {formatTime(result.timeSpent || 0)}
                            </div>
                            <div>
                              <span className="font-medium">Completed:</span> {new Date(result.completedAt).toLocaleDateString()}
                            </div>
                            <div>
                              <span className="font-medium">Performance Level:</span> 
                              <span className={`ml-1 font-semibold ${performance.color}`}>{performance.level}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Incomplete Assessments Section */}
          {progress.overallProgress < 100 && (
            <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-orange-800 mb-4">📋 Remaining Assessments</h3>
              <p className="text-orange-700 mb-4">
                To get a complete picture of your child's cognitive abilities, consider completing these additional assessments:
              </p>
              <div className="space-y-2">
                {ALL_TRACKED_QUIZZES.filter(quiz => !results.some(r => r.quizId === quiz.id)).map(quiz => (
                  <div key={quiz.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                    <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                    <div>
                      <h4 className="font-medium text-gray-800">{quiz.name}</h4>
                      <p className="text-sm text-gray-600 capitalize">{getSubcategoryName(quiz.subcategory)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-orange-100 rounded-lg">
                <p className="text-sm text-orange-800">
                  💡 <strong>Tip:</strong> Each assessment provides valuable insights into different cognitive skills. 
                  Completing all assessments will give you the most comprehensive understanding of your child's abilities.
                </p>
              </div>
            </div>
          )}

          {/* Recommendations Section */}
          <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center space-x-2">
              <Award size={24} />
              <span>Recommendations for Parents</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-green-900 mb-2">🌟 Strengths to Celebrate:</h4>
                <ul className="text-green-800 text-sm space-y-1 ml-4">
                  {results.filter(r => r.percentage >= 85).map((result, idx) => (
                    <li key={`strength-${result.quizId}-${idx}`} className="list-disc">
                      <strong>{result.quizName}:</strong> Excellent performance showing mastery in this area
                    </li>
                  ))}
                  {results.filter(r => r.percentage >= 85).length === 0 && (
                    <li className="list-disc">Your child is developing their skills across all areas assessed</li>
                  )}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-green-900 mb-2">📈 Areas for Growth:</h4>
                <ul className="text-green-800 text-sm space-y-1 ml-4">
                  {results.filter(r => r.percentage < 75).map((result, idx) => (
                    <li key={`growth-${result.quizId}-${idx}`} className="list-disc">
                      <strong>{getSubcategoryName(remapQuizCategory(result))}:</strong> Consider additional practice and support
                    </li>
                  ))}
                  {results.filter(r => r.percentage < 75).length === 0 && (
                    <li className="list-disc">Your child shows consistent performance across all assessed areas</li>
                  )}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-green-900 mb-2">💡 General Recommendations:</h4>
                <ul className="text-green-800 text-sm space-y-1 ml-4">
                  <li className="list-disc">Encourage regular practice in areas where scores were below 75%</li>
                  <li className="list-disc">Celebrate successes and maintain motivation for continued learning</li>
                  <li className="list-disc">Consider educational games and activities that target specific skill areas</li>
                  <li className="list-disc">Discuss results with your child's teacher for additional classroom support</li>
                  <li className="list-disc">Re-assess periodically to track improvement over time</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              This assessment provides insights into your child's cognitive abilities at this point in time. 
              Results should be considered alongside other factors such as classroom performance, motivation, and individual learning style. 
              For concerns about your child's development, please consult with educational professionals.
            </p>
          </div>
        </div>
      </motion.div>

    </motion.div>
  );
};

export default MindSectionReport;