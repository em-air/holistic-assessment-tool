import React from 'react';
import { motion } from 'framer-motion';
import { X, Download, Share2, Brain, Award } from 'lucide-react';
import { ProgressTracker, MIND_QUIZZES, QuizResult } from '../utils/progressTracker';

interface MindSectionReportProps {
  onClose: () => void;
}

const MindSectionReport: React.FC<MindSectionReportProps> = ({ onClose }) => {
  
  const progress = ProgressTracker.getProgress();
  const results = progress.mindSectionResults;

  // Calculate statistics
  const averageScore = results.length > 0 
    ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
    : 0;
  
  const totalTimeSpent = results.reduce((sum, r) => sum + (r.timeSpent || 0), 0);
  const totalQuestions = results.reduce((sum, r) => sum + r.totalQuestions, 0);
  const totalCorrect = results.reduce((sum, r) => sum + r.score, 0);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const getSubcategoryName = (subcategory: string): string => {
    const names: Record<string, string> = {
      'attention': 'Attention & Memory',
      'learning-style': 'Learning Styles',
      'critical-thinking': 'Critical Thinking',
      'perception': 'Perception'
    };
    return names[subcategory] || subcategory;
  };

  const getSkillDescription = (subcategory: string): string => {
    const descriptions: Record<string, string> = {
      'attention': 'Attention and Memory skills involve the ability to focus on tasks, filter out distractions, and retain information for both short-term and long-term use. These skills are fundamental for learning and academic success.',
      'learning-style': 'Learning Styles refer to how your child best receives, processes, and retains information. Understanding their preferred learning style helps optimize their educational experience.',
      'critical-thinking': 'Critical Thinking encompasses reasoning, problem-solving, and analytical skills. It includes the ability to make connections, recognize patterns, and think logically about relationships between concepts.',
      'perception': 'Perception involves how your child interprets and understands visual and spatial information. This includes recognizing patterns, understanding spatial relationships, and processing visual details.'
    };
    return descriptions[subcategory] || 'This skill area measures important cognitive abilities.';
  };

  const getDetailedAnalysis = (result: QuizResult): string => {
    const subcategory = result.subcategory;
    
    let analysis = '';
    
    if (subcategory === 'attention') {
      if (result.percentage >= 90) {
        analysis = 'Your child demonstrates excellent attention and memory capabilities. They can focus well on tasks and remember information effectively. This is a strong foundation for academic learning.';
      } else if (result.percentage >= 75) {
        analysis = 'Your child shows good attention and memory skills. They generally focus well and retain information, with some areas for continued development.';
      } else if (result.percentage >= 60) {
        analysis = 'Your child has developing attention and memory skills. Consider activities that help improve focus and memory techniques to support their learning.';
      } else {
        analysis = 'Your child may benefit from additional support in developing attention and memory skills. Simple focusing exercises and memory games can be helpful.';
      }
    } else if (subcategory === 'learning-style') {
      if (result.percentage >= 90) {
        analysis = 'Your child has a clear understanding of how they learn best. This self-awareness will help them succeed across different learning situations.';
      } else if (result.percentage >= 75) {
        analysis = 'Your child shows good awareness of their learning preferences. Encourage them to use their preferred learning methods when studying.';
      } else {
        analysis = 'Your child is still discovering their optimal learning style. Try different approaches to see what works best for them.';
      }
    } else if (subcategory === 'critical-thinking') {
      if (result.percentage >= 90) {
        analysis = 'Your child excels in critical thinking and reasoning. They can make connections, solve problems, and think logically about complex relationships.';
      } else if (result.percentage >= 75) {
        analysis = 'Your child demonstrates solid critical thinking abilities. They can reason through problems and make logical connections most of the time.';
      } else if (result.percentage >= 60) {
        analysis = 'Your child is developing their critical thinking skills. Encourage them to ask questions and think through problems step by step.';
      } else {
        analysis = 'Your child would benefit from activities that build reasoning and problem-solving skills. Puzzles, games, and guided discussions can help.';
      }
    } else if (subcategory === 'perception') {
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



  const exportReport = (): void => {
    const date = new Date().toLocaleDateString();
    const isCompleteReport = progress.overallProgress === 100;
    let reportText = `COGNITIVE SKILLS ASSESSMENT REPORT${isCompleteReport ? '' : ' (PARTIAL)'}
Generated: ${date}

================================
ASSESSMENT SUMMARY
================================

Overall Progress: ${progress.overallProgress}% (${results.length}/${MIND_QUIZZES.length} assessments completed)
Average Score: ${averageScore}%
Total Questions Answered: ${totalCorrect}/${totalQuestions}
Total Time Invested: ${formatTime(totalTimeSpent)}

Dear Parent,
This ${isCompleteReport ? 'comprehensive' : 'partial'} report provides an overview of your child's performance across key cognitive skill areas. ${isCompleteReport ? 'Each section below explains what skills were tested and how your child performed.' : 'Your child has completed some assessments so far. Additional assessments can be taken for a more complete evaluation.'}

================================
DETAILED SKILL ANALYSIS
================================

`;

    // Group results by skill category
    ['attention', 'critical-thinking', 'perception', 'learning-style'].forEach(category => {
      const categoryResults = results.filter(r => r.subcategory === category);
      if (categoryResults.length === 0) return;
      
      const categoryAverage = Math.round(
        categoryResults.reduce((sum, r) => sum + r.percentage, 0) / categoryResults.length
      );
      
      reportText += `${getSubcategoryName(category).toUpperCase()} - Average: ${categoryAverage}%
${'-'.repeat(50)}

What this skill area measures:
${getSkillDescription(category)}

Assessment Results:
`;
      
      categoryResults.forEach(result => {
        const performance = ProgressTracker.getPerformanceLevel(result.percentage);
        reportText += `
• ${result.quizName}
  Score: ${result.score}/${result.totalQuestions} (${result.percentage}%)
  Performance Level: ${performance.level} ${performance.emoji}
  Time Spent: ${formatTime(result.timeSpent || 0)}
  Analysis: ${getDetailedAnalysis(result)}

`;
      });
      
      reportText += '\n';
    });

    reportText += `================================
RECOMMENDATIONS FOR PARENTS
================================

STRENGTHS TO CELEBRATE:
`;
    
    results.filter(r => r.percentage >= 85).forEach(result => {
      reportText += `• ${result.quizName}: Excellent performance showing mastery\n`;
    });
    
    if (results.filter(r => r.percentage >= 85).length === 0) {
      reportText += `• Your child is developing their skills across all areas assessed\n`;
    }

    reportText += `
AREAS FOR GROWTH:
`;
    
    results.filter(r => r.percentage < 75).forEach(result => {
      reportText += `• ${getSubcategoryName(result.subcategory)}: Consider additional practice and support\n`;
    });
    
    if (results.filter(r => r.percentage < 75).length === 0) {
      reportText += `• Your child shows consistent performance across all assessed areas\n`;
    }

    reportText += `
GENERAL RECOMMENDATIONS:
• Encourage regular practice in areas where scores were below 75%
• Celebrate successes and maintain motivation for continued learning
• Consider educational games and activities that target specific skill areas
• Discuss results with your child's teacher for additional classroom support
• Re-assess periodically to track improvement over time

================================
IMPORTANT NOTE
================================
This assessment provides insights into your child's cognitive abilities at this point in time. Results should be considered alongside other factors such as classroom performance, motivation, and individual learning style. For concerns about your child's development, please consult with educational professionals.

Report generated by Holistic Assessment Tool
${date}
`;

    const dataBlob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `cognitive-skills-report-${new Date().toISOString().split('T')[0]}.txt`;
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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
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
                <span>Mind Section Report</span>
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
                onClick={exportReport}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors duration-200"
                title="Export Report"
              >
                <Download size={20} />
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
                  ? `The assessment covers all ${MIND_QUIZZES.length} areas that are fundamental to learning and academic success.`
                  : `Your child has completed ${results.length} out of ${MIND_QUIZZES.length} assessments so far. You can continue taking additional assessments to get a more complete picture.`
                }
              </p>
            </div>
          </div>

          {/* Skill-by-Skill Breakdown */}
          <div className="space-y-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">🧠 Detailed Skill Analysis</h3>
            
            {/* Group results by skill category */}
            {['attention', 'critical-thinking', 'perception', 'learning-style'].map(category => {
              const categoryResults = results.filter(r => r.subcategory === category);
              if (categoryResults.length === 0) return null;
              
              const categoryAverage = Math.round(
                categoryResults.reduce((sum, r) => sum + r.percentage, 0) / categoryResults.length
              );
              
              return (
                <div key={category} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-bold text-gray-800">{getSubcategoryName(category)}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Category Average:</span>
                        <span className={`font-bold text-lg ${
                          categoryAverage >= 90 ? 'text-green-600' :
                          categoryAverage >= 75 ? 'text-blue-600' :
                          categoryAverage >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
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
                      
                      return (
                        <div key={result.quizId} className="border-l-4 border-gray-200 pl-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h5 className="font-semibold text-gray-800">{result.quizName}</h5>
                              {result.gradeLevel && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mt-1 inline-block">
                                  Grade {result.gradeLevel}
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              <div className={`text-xl font-bold ${performance.color} flex items-center space-x-1`}>
                                <span>{performance.emoji}</span>
                                <span>{result.percentage}%</span>
                              </div>
                              <div className="text-sm text-gray-500">{result.score}/{result.totalQuestions} correct</div>
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
                {MIND_QUIZZES.filter(quiz => !results.some(r => r.quizId === quiz.id)).map(quiz => (
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
                  {results.filter(r => r.percentage >= 85).map(result => (
                    <li key={result.quizId} className="list-disc">
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
                  {results.filter(r => r.percentage < 75).map(result => (
                    <li key={result.quizId} className="list-disc">
                      <strong>{getSubcategoryName(result.subcategory)}:</strong> Consider additional practice and support
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