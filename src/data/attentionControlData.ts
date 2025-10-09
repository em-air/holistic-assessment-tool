// Attentional Control Scale for Children (ACS-C) - Based on research by van Son et al. (2021)
// Using the revised two-factor model with best fit

export interface AttentionControlQuestion {
  id: number;
  subscale: 'focusing' | 'shifting';
  question: string;
  kidFriendlyQuestion: string;
  type: 'rating';
  options: number[];
  reverse: boolean; // For reverse-scored items
}

export const attentionControlQuestions: AttentionControlQuestion[] = [
  // ATTENTIONAL FOCUSING SUBSCALE (Items from best-fitting model)
  {
    id: 1,
    subscale: 'focusing',
    question: "It's very hard for me to concentrate on a difficult lesson, if there is a lot of noise in the class",
    kidFriendlyQuestion: "It's hard for me to focus on schoolwork when the classroom is noisy",
    type: 'rating',
    options: [1, 2, 3, 4],
    reverse: false
  },
  {
    id: 2,
    subscale: 'focusing',
    question: "If I have to concentrate and solve a difficult math problem, I have trouble focusing my attention",
    kidFriendlyQuestion: "When I'm doing hard math problems, it's difficult for me to focus",
    type: 'rating',
    options: [1, 2, 3, 4],
    reverse: false
  },
  {
    id: 3,
    subscale: 'focusing',
    question: "When I am working hard on something, I still get distracted by things going on around me",
    kidFriendlyQuestion: "When I'm working on something important, I get distracted by what's happening around me",
    type: 'rating',
    options: [1, 2, 3, 4],
    reverse: false
  },
  {
    id: 6,
    subscale: 'focusing',
    question: "When I am reading in the classroom, I am easily disturbed by other children talking to each other",
    kidFriendlyQuestion: "When I'm reading, other kids talking makes it hard for me to concentrate",
    type: 'rating',
    options: [1, 2, 3, 4],
    reverse: false
  },
  {
    id: 7,
    subscale: 'focusing',
    question: "When I try to concentrate myself, I find it difficult not to think about other things",
    kidFriendlyQuestion: "When I try to focus, my mind keeps thinking about other things",
    type: 'rating',
    options: [1, 2, 3, 4],
    reverse: false
  },
  {
    id: 8,
    subscale: 'focusing',
    question: "I find it difficult to concentrate myself when I am excited about something",
    kidFriendlyQuestion: "It's hard for me to focus when I'm excited about something",
    type: 'rating',
    options: [1, 2, 3, 4],
    reverse: false
  },
  {
    id: 11,
    subscale: 'focusing',
    question: "When I have to start a new task, it takes me a while to get really involved in it",
    kidFriendlyQuestion: "When I start something new, it takes me time to really get into it",
    type: 'rating',
    options: [1, 2, 3, 4],
    reverse: false
  },
  {
    id: 12,
    subscale: 'focusing',
    question: "When the teacher explains something, I find it difficult to understand and write it down at the same time",
    kidFriendlyQuestion: "It's hard for me to listen to the teacher and take notes at the same time",
    type: 'rating',
    options: [1, 2, 3, 4],
    reverse: false
  },
  {
    id: 20,
    subscale: 'focusing',
    question: "I find it difficult to let go my own way of thinking about something, and to look at it in a different way",
    kidFriendlyQuestion: "It's hard for me to think about things in a different way once I have an idea",
    type: 'rating',
    options: [1, 2, 3, 4],
    reverse: false
  },

  // ATTENTIONAL SHIFTING SUBSCALE (Items from best-fitting model)
  {
    id: 10,
    subscale: 'shifting',
    question: "When I am doing something, I can easily stop and switch to some other task",
    kidFriendlyQuestion: "I can easily stop what I'm doing and switch to something else",
    type: 'rating',
    options: [1, 2, 3, 4],
    reverse: true // Reverse scored
  },
  {
    id: 13,
    subscale: 'shifting',
    question: "When it is necessary, I can become interested in a new topic very quickly",
    kidFriendlyQuestion: "I can quickly get interested in new things when I need to",
    type: 'rating',
    options: [1, 2, 3, 4],
    reverse: true // Reverse scored
  },
  {
    id: 14,
    subscale: 'shifting',
    question: "It is easy for me to read or write, while I am also talking to someone on the telephone",
    kidFriendlyQuestion: "I can easily do homework while talking to someone",
    type: 'rating',
    options: [1, 2, 3, 4],
    reverse: true // Reverse scored
  },
  {
    id: 17,
    subscale: 'shifting',
    question: "After being interrupted or distracted, I can easily shift my attention back to what I was doing before",
    kidFriendlyQuestion: "When something interrupts me, I can easily go back to what I was doing",
    type: 'rating',
    options: [1, 2, 3, 4],
    reverse: true // Reverse scored
  },
  {
    id: 18,
    subscale: 'shifting',
    question: "When I am daydreaming or having distracting thoughts, it is easy for me to switch back to the work I have to do",
    kidFriendlyQuestion: "When my mind wanders, I can easily get back to my work",
    type: 'rating',
    options: [1, 2, 3, 4],
    reverse: true // Reverse scored
  },
  {
    id: 19,
    subscale: 'shifting',
    question: "It is easy for me to switch back and forth between two different tasks",
    kidFriendlyQuestion: "I can easily switch between doing different activities",
    type: 'rating',
    options: [1, 2, 3, 4],
    reverse: true // Reverse scored
  }
];

// Rating scale labels
export const ratingLabels = {
  1: "Almost Never",
  2: "Sometimes", 
  3: "Often",
  4: "Always"
};

// Kid-friendly rating labels
export const kidFriendlyRatingLabels = {
  1: "Never",
  2: "Sometimes", 
  3: "Often",
  4: "Always"
};

// Scoring algorithm based on the research
export const calculateAttentionScores = (responses: Record<number, number>) => {
  let focusingScore = 0;
  let shiftingScore = 0;
  let focusingCount = 0;
  let shiftingCount = 0;

  attentionControlQuestions.forEach(question => {
    const response = responses[question.id];
    if (response !== undefined) {
      // Reverse score if needed (higher scores = better attention control)
      const score = question.reverse ? (5 - response) : response;
      
      if (question.subscale === 'focusing') {
        focusingScore += score;
        focusingCount++;
      } else {
        shiftingScore += score;
        shiftingCount++;
      }
    }
  });

  const focusingAverage = focusingCount > 0 ? focusingScore / focusingCount : 0;
  const shiftingAverage = shiftingCount > 0 ? shiftingScore / shiftingCount : 0;
  const totalScore = focusingScore + shiftingScore;
  const totalPossible = (focusingCount + shiftingCount) * 4;
  const percentageScore = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;

  return {
    focusing: {
      raw: focusingScore,
      average: focusingAverage,
      count: focusingCount
    },
    shifting: {
      raw: shiftingScore,
      average: shiftingAverage,
      count: shiftingCount
    },
    total: {
      raw: totalScore,
      percentage: percentageScore,
      possible: totalPossible
    }
  };
};

// Interpretation guidelines based on research
export const interpretScores = (scores: ReturnType<typeof calculateAttentionScores>) => {
  const { focusing, shifting, total } = scores;
  
  const focusingLevel = focusing.average >= 3 ? 'Good' : focusing.average >= 2 ? 'Fair' : 'Needs Support';
  const shiftingLevel = shifting.average >= 3 ? 'Good' : shifting.average >= 2 ? 'Fair' : 'Needs Support';
  const overallLevel = total.percentage >= 75 ? 'Strong' : total.percentage >= 50 ? 'Moderate' : 'Developing';

  return {
    focusing: {
      level: focusingLevel,
      description: focusingLevel === 'Good' 
        ? 'Shows good ability to maintain focus and concentrate on tasks.'
        : focusingLevel === 'Fair'
        ? 'Shows some ability to focus but may benefit from strategies to improve concentration.'
        : 'May have difficulty maintaining focus and could benefit from attention support strategies.'
    },
    shifting: {
      level: shiftingLevel,
      description: shiftingLevel === 'Good'
        ? 'Shows good ability to switch attention between tasks and adapt to changes.'
        : shiftingLevel === 'Fair'
        ? 'Shows some flexibility in attention but may benefit from practice with task switching.'
        : 'May have difficulty switching attention between tasks and adapting to changes.'
    },
    overall: {
      level: overallLevel,
      description: overallLevel === 'Strong'
        ? 'Shows strong attentional control abilities across both focusing and shifting.'
        : overallLevel === 'Moderate'
        ? 'Shows moderate attentional control with room for improvement in some areas.'
        : 'Attentional control skills are still developing and may benefit from targeted support.'
    }
  };
};

// Recommendations based on scores
export const getRecommendations = (interpretation: ReturnType<typeof interpretScores>) => {
  const recommendations: string[] = [];

  if (interpretation.focusing.level !== 'Good') {
    recommendations.push(
      'Practice mindfulness exercises to improve focus',
      'Create a quiet, distraction-free study environment',
      'Break tasks into smaller, manageable chunks',
      'Use visual cues and reminders to stay on task'
    );
  }

  if (interpretation.shifting.level !== 'Good') {
    recommendations.push(
      'Practice switching between different types of activities',
      'Use transition cues when changing tasks',
      'Work on cognitive flexibility exercises',
      'Practice planning and organizing multiple tasks'
    );
  }

  if (interpretation.overall.level === 'Developing') {
    recommendations.push(
      'Consider consulting with a school counselor or educational specialist',
      'Discuss attention strategies with teachers',
      'Establish consistent routines and structure',
      'Consider professional assessment if difficulties persist'
    );
  }

  return recommendations;
};