/**
 * Backend Quiz Data - Learning Styles
 * 
 * Learning styles assessment questions.
 */

export interface LearningStyleQuestion {
  id: number;
  question: string;
  options: {
    id: string;
    text: string;
    style: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  }[];
}

export const learningStyleQuestions: LearningStyleQuestion[] = [
  {
    id: 1,
    question: 'When learning something new, I prefer to:',
    options: [
      { id: 'a', text: 'Watch a video or see pictures', style: 'visual' },
      { id: 'b', text: 'Listen to someone explain it', style: 'auditory' },
      { id: 'c', text: 'Try it out myself', style: 'kinesthetic' },
      { id: 'd', text: 'Read about it in a book', style: 'reading' }
    ]
  },
  {
    id: 2,
    question: 'When I need to remember something, I:',
    options: [
      { id: 'a', text: 'Picture it in my mind', style: 'visual' },
      { id: 'b', text: 'Say it out loud to myself', style: 'auditory' },
      { id: 'c', text: 'Write it down or act it out', style: 'kinesthetic' },
      { id: 'd', text: 'Read and re-read the information', style: 'reading' }
    ]
  },
  {
    id: 3,
    question: 'In class, I learn best when:',
    options: [
      { id: 'a', text: 'The teacher uses diagrams and charts', style: 'visual' },
      { id: 'b', text: 'The teacher talks and discusses', style: 'auditory' },
      { id: 'c', text: 'We do hands-on activities', style: 'kinesthetic' },
      { id: 'd', text: 'We read from textbooks', style: 'reading' }
    ]
  },
  {
    id: 4,
    question: 'When I get lost, I prefer to:',
    options: [
      { id: 'a', text: 'Look at a map', style: 'visual' },
      { id: 'b', text: 'Ask someone for directions', style: 'auditory' },
      { id: 'c', text: 'Trust my instincts and explore', style: 'kinesthetic' },
      { id: 'd', text: 'Look up directions online', style: 'reading' }
    ]
  },
  {
    id: 5,
    question: 'When telling a story, I:',
    options: [
      { id: 'a', text: 'Describe how things looked', style: 'visual' },
      { id: 'b', text: 'Use different voices and sounds', style: 'auditory' },
      { id: 'c', text: 'Act out parts with my hands', style: 'kinesthetic' },
      { id: 'd', text: 'Focus on details and facts', style: 'reading' }
    ]
  }
];

/**
 * Get all questions
 */
export const getLearningStyleQuestions = (): LearningStyleQuestion[] => {
  return learningStyleQuestions;
};

/**
 * Calculate learning style from answers
 */
export const calculateLearningStyle = (answers: Record<number, string>): {
  visual: number;
  auditory: number;
  kinesthetic: number;
  reading: number;
  dominantStyle: string;
} => {
  const scores = { visual: 0, auditory: 0, kinesthetic: 0, reading: 0 };
  
  for (const [questionId, answerId] of Object.entries(answers)) {
    const question = learningStyleQuestions.find(q => q.id === parseInt(questionId));
    if (!question) continue;
    
    const option = question.options.find(o => o.id === answerId);
    if (option) {
      scores[option.style]++;
    }
  }
  
  const dominantStyle = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])[0][0];
  
  return { ...scores, dominantStyle };
};
