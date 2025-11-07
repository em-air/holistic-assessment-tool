import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Font 
} from '@react-pdf/renderer';
import { ProgressData, MIND_QUIZZES } from '../utils/progressTracker';

// Register fonts (using default fonts for now)
Font.register({
  family: 'Roboto',
  src: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxK.woff2'
});

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
    borderBottom: 2,
    borderColor: '#6366f1',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
    borderBottom: 1,
    borderColor: '#e5e7eb',
    paddingBottom: 5,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  summaryCard: {
    backgroundColor: '#f3f4f6',
    padding: 10,
    borderRadius: 5,
    width: '22%',
    textAlign: 'center',
  },
  summaryNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 9,
    color: '#6b7280',
  },
  parentNote: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 5,
    marginBottom: 15,
    borderLeft: 3,
    borderColor: '#3b82f6',
  },
  categorySection: {
    marginBottom: 15,
    backgroundColor: '#fafafa',
    padding: 12,
    borderRadius: 5,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  categoryDescription: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 10,
    lineHeight: 1.4,
  },
  quizResult: {
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#ffffff',
    borderRadius: 3,
    borderLeft: 2,
    borderColor: '#e5e7eb',
  },
  quizTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 3,
  },
  quizDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  analysisText: {
    fontSize: 10,
    color: '#4b5563',
    lineHeight: 1.3,
    marginTop: 5,
  },
  recommendationsSection: {
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 5,
    marginTop: 10,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 8,
  },
  recommendationItem: {
    fontSize: 10,
    color: '#166534',
    marginBottom: 3,
    paddingLeft: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 8,
    color: '#9ca3af',
    textAlign: 'center',
    borderTop: 1,
    borderColor: '#e5e7eb',
    paddingTop: 10,
  },
  incompleteSection: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 5,
    marginBottom: 15,
    borderLeft: 3,
    borderColor: '#f59e0b',
  },
  incompleteTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 5,
  },
  incompleteItem: {
    fontSize: 10,
    color: '#92400e',
    marginBottom: 2,
    paddingLeft: 8,
  },
});

interface ReportPDFProps {
  progress: ProgressData;
}

const ReportPDF: React.FC<ReportPDFProps> = ({ progress }) => {
  const results = progress.mindSectionResults;
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
      'perception': 'Perception'
    };
    return names[subcategory] || subcategory;
  };

  const getCategoryColor = (subcategory: string): string => {
    const colors: Record<string, string> = {
      'attention': '#eab308', // yellow
      'memory': '#f97316',    // orange  
      'learning-style': '#22c55e', // green
      'critical-thinking': '#a855f7', // purple
      'perception': '#6366f1'  // indigo
    };
    return colors[subcategory] || '#6b7280';
  };

  const remapQuizCategory = (result: any): string => {
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
      'attention': 'Attention skills involve the ability to focus on tasks and filter out distractions effectively.',
      'memory': 'Memory skills encompass the ability to retain, recall, and work with information over different time periods.',
      'learning-style': 'Learning Styles refer to how your child best receives, processes, and retains information.',
      'critical-thinking': 'Critical Thinking encompasses reasoning, problem-solving, and analytical skills.',
      'perception': 'Perception involves how your child interprets and understands visual and spatial information.'
    };
    return descriptions[subcategory] || 'This skill area measures important cognitive abilities.';
  };

  const getDetailedAnalysis = (result: any): string => {
    const category = remapQuizCategory(result);
    
    if (category === 'attention') {
      return result.percentage >= 75 ? 'Shows strong attention and focus capabilities.' : 'Developing attention skills - practice with focus exercises recommended.';
    } else if (category === 'memory') {
      // Special handling for Memory Quiz
      if (result.quizId === 'memory-quiz' && result.additionalData) {
        const { levelsCompleted, endReason, attemptsPerLevel } = result.additionalData;
        const totalAttempts = Object.values(attemptsPerLevel || {}).reduce((sum: number, attempts: any) => sum + attempts, 0);
        
        if (endReason === 'out-of-tries') {
          return `Completed ${levelsCompleted} of 6 levels with ${totalAttempts} attempts. Shows persistence and can improve with practice.`;
        } else if (result.percentage >= 90) {
          return `Excellent memory performance! Completed all levels with ${totalAttempts} attempts, showing strong visual memory skills.`;
        } else {
          return `Good memory skills with ${totalAttempts} attempts across ${levelsCompleted} levels. Regular practice will strengthen these abilities.`;
        }
      } else {
        return result.percentage >= 75 ? 'Shows strong memory and recall abilities.' : 'Developing memory skills - memory games and exercises recommended.';
      }
    } else if (category === 'learning-style') {
      return result.percentage >= 75 ? 'Has good awareness of learning preferences.' : 'Still discovering optimal learning style.';
    } else if (category === 'critical-thinking') {
      return result.percentage >= 75 ? 'Demonstrates solid critical thinking abilities.' : 'Developing reasoning and problem-solving skills.';
    } else if (category === 'perception') {
      return result.percentage >= 75 ? 'Shows good visual perception abilities.' : 'Developing visual processing skills.';
    }
    
    return 'Assessment completed successfully.';
  };



  const isCompleteReport = progress.overallProgress === 100;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Cognitive Skills Assessment Report
            {!isCompleteReport && ' (Partial)'}
          </Text>
          <Text style={styles.subtitle}>
            Generated: {new Date().toLocaleDateString()}
          </Text>
          <Text style={styles.subtitle}>
            {isCompleteReport ? 'Complete' : 'Progress'} assessment overview
          </Text>
        </View>

        {/* Summary Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ASSESSMENT SUMMARY</Text>
          
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{progress.overallProgress}%</Text>
              <Text style={styles.summaryLabel}>Assessments Completed</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{averageScore}%</Text>
              <Text style={styles.summaryLabel}>Overall Average</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{results.length}</Text>
              <Text style={styles.summaryLabel}>Skills Areas Assessed</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{formatTime(totalTimeSpent)}</Text>
              <Text style={styles.summaryLabel}>Time Invested</Text>
            </View>
          </View>

          <View style={styles.parentNote}>
            <Text style={{ fontSize: 11, color: '#1e40af', marginBottom: 5, fontWeight: 'bold' }}>
              Dear Parent,
            </Text>
            <Text style={{ fontSize: 10, color: '#1e40af', lineHeight: 1.4 }}>
              This {isCompleteReport ? 'comprehensive' : 'partial'} report provides an overview of your child's 
              performance across key cognitive skill areas. {isCompleteReport 
                ? 'Each section explains what skills were tested and how your child performed.' 
                : 'Your child has completed some assessments so far. Additional assessments can be taken for a more complete evaluation.'}
            </Text>
          </View>
        </View>

        {/* Skill Analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DETAILED SKILL ANALYSIS</Text>
          
          {['attention', 'memory', 'learning-style', 'critical-thinking', 'perception'].map(category => {
            const categoryResults = results.filter(r => remapQuizCategory(r) === category);
            if (categoryResults.length === 0) return null;
            
            const categoryAverage = Math.round(
              categoryResults.reduce((sum, r) => sum + r.percentage, 0) / categoryResults.length
            );

            return (
              <View key={category} style={styles.categorySection}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={[styles.categoryTitle, { color: getCategoryColor(category) }]}>{getSubcategoryName(category)}</Text>
                  <Text style={[styles.summaryNumber, { color: getCategoryColor(category) }]}>
                    {categoryAverage}%
                  </Text>
                </View>
                
                <Text style={styles.categoryDescription}>
                  {getSkillDescription(category)}
                </Text>

                {categoryResults.map(result => {
                  const performance = result.percentage >= 90 ? 'Excellent' : 
                                    result.percentage >= 75 ? 'Good' : 
                                    result.percentage >= 60 ? 'Developing' : 'Needs Support';
                  
                  return (
                    <View key={result.quizId} style={styles.quizResult}>
                      <Text style={styles.quizTitle}>{result.quizName}</Text>
                      
                      <View style={styles.quizDetails}>
                        <Text style={{ fontSize: 10, color: '#6b7280' }}>
                          Performance: {performance}
                        </Text>
                        <Text style={[styles.scoreText, { color: getCategoryColor(remapQuizCategory(result)) }]}>
                          {result.percentage}%
                        </Text>
                      </View>

                      {/* Memory Quiz Additional Details */}
                      {result.quizId === 'memory-quiz' && result.additionalData && (
                        <View style={{ marginBottom: 5 }}>
                          <Text style={{ fontSize: 9, color: '#6b7280' }}>
                            Levels: {result.additionalData.levelsCompleted}/6 | 
                            Attempts: {Object.values(result.additionalData.attemptsPerLevel || {}).reduce((sum: number, attempts: any) => sum + attempts, 0)} | 
                            Status: {result.additionalData.endReason === 'finished' ? 'Completed' : 'Attempt limit reached'}
                          </Text>
                        </View>
                      )}

                      <Text style={styles.analysisText}>
                        {getDetailedAnalysis(result)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>

        {/* Incomplete Assessments */}
        {progress.overallProgress < 100 && (
          <View style={styles.incompleteSection}>
            <Text style={styles.incompleteTitle}>REMAINING ASSESSMENTS</Text>
            <Text style={{ fontSize: 10, color: '#92400e', marginBottom: 8 }}>
              To get a complete picture, consider completing these additional assessments:
            </Text>
            {MIND_QUIZZES.filter(quiz => !results.some(r => r.quizId === quiz.id)).map(quiz => {
              const category = quiz.id === 'memory-assessment' || quiz.id === 'memory-quiz' ? 'memory' : 
                              quiz.id === 'attention-assessment' ? 'attention' : quiz.subcategory;
              return (
                <Text key={quiz.id} style={styles.incompleteItem}>
                  • {quiz.name} ({getSubcategoryName(category)})
                </Text>
              );
            })}
          </View>
        )}

        {/* Recommendations */}
        <View style={styles.recommendationsSection}>
          <Text style={styles.recommendationTitle}>RECOMMENDATIONS FOR PARENTS</Text>
          
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#166534', marginBottom: 5 }}>
            STRENGTHS TO CELEBRATE:
          </Text>
          {results.filter(r => r.percentage >= 85).length > 0 ? (
            results.filter(r => r.percentage >= 85).map(result => (
              <Text key={result.quizId} style={styles.recommendationItem}>
                • {result.quizName}: Excellent performance showing mastery
              </Text>
            ))
          ) : (
            <Text style={styles.recommendationItem}>
              • Your child is developing skills across all assessed areas
            </Text>
          )}

          <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#166534', marginTop: 8, marginBottom: 5 }}>
            GENERAL RECOMMENDATIONS:
          </Text>
          <Text style={styles.recommendationItem}>
            • Encourage regular practice in areas where scores were below 75%
          </Text>
          <Text style={styles.recommendationItem}>
            • Celebrate successes and maintain motivation for continued learning
          </Text>
          <Text style={styles.recommendationItem}>
            • Consider educational games that target specific skill areas
          </Text>
          <Text style={styles.recommendationItem}>
            • Discuss results with your child's teacher for classroom support
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            This assessment provides insights into your child's cognitive abilities at this point in time. 
            Results should be considered alongside classroom performance, motivation, and individual learning style.
          </Text>
          <Text style={{ marginTop: 5 }}>
            Report generated by Holistic Assessment Tool • {new Date().toLocaleDateString()}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default ReportPDF;