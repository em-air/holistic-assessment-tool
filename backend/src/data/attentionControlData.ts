/**
 * Attentional Control Scale for Children (ACS-C)
 * Based on research by van Son et al. (2021) using the revised two-factor model.
 */

export interface AttentionControlQuestion {
  id: number;
  subscale: 'focusing' | 'shifting';
  question: string;
  kidFriendlyQuestion: string;
  example: string;
  type: 'rating';
  options: number[];
  reverse: boolean; // For reverse-scored items
}

export const attentionControlQuestions: AttentionControlQuestion[] = [
  // ATTENTIONAL FOCUSING SUBSCALE
  {
    id: 1,
    subscale: 'focusing',
    question: "It's very hard for me to concentrate on a difficult lesson, if there is a lot of noise in the class",
    kidFriendlyQuestion: "It's hard for me to do my work when the class is loud",
    example: "For example, if everyone is talking and you're trying to read or do a worksheet, is it hard to keep going?",
    type: 'rating',
    options: [1, 2, 3, 4],
    reverse: false
  },
  {
    id: 2,
    subscale: 'focusing',
    question: "If I have to concentrate and solve a difficult math problem, I have trouble focusing my attention",
    kidFriendlyQuestion: "When math is hard, it's tough to keep my mind on it",
    example: "For example, when you get a really tricky math problem, does your brain want to think about something else instead?",
    type: 'rating',
    options: [1, 2, 3, 4],
    reverse: false
  },
  {
    id: 3,
    subscale: 'focusing',
    question: "When I am working hard on something, I still get distracted by things going on around me",
    kidFriendlyQuestion: "When I'm working, things around me make me lose track",
    example: "For example, if someone walks by or you hear a noise, do you forget what you were doing?",
    type: 'rating',
    options: [1, 2, 3, 4],
    reverse: false
  },
  {
    id: 6,
    subscale: 'focusing',
    question: "When I am reading in the classroom, I am easily disturbed by other children talking to each other",
    kidFriendlyQuestion: "When I read, other kids talking makes it hard to keep going",
    example: "For example, if you're reading a story and kids next to you are chatting, do you lose your place or stop reading?",
    type: 'rating',
    options: [1, 2, 3, 4],
    reverse: false
  },
  {
    id: 7,
    subscale: 'focusing',
    question: "When I try to concentrate myself, I find it difficult not to think about other things",
    kidFriendlyQuestion: "When I try to think about one thing, my mind goes to other things",
    example: "For example, when you try to focus on your homework but your brain keeps thinking about a game or what's for lunch.",
    type: 'rating',
    options: [1, 2, 3, 4],
    reverse: false
  },
  {
    id: 8,
    subscale: 'focusing',
    question: "I find it difficult to concentrate myself when I am excited about something",
    kidFriendlyQuestion: "It's hard to do my work when I feel very excited",
    example: "For example, if it's almost your birthday or there's a fun trip coming, can you still do your schoolwork or is it hard to sit still?",
    type: 'rating',
    options: [1, 2, 3, 4],
    reverse: false
  },
  {
    id: 11,
    subscale: 'focusing',
    question: "When I have to start a new task, it takes me a while to get really involved in it",
    kidFriendlyQuestion: "When I start something new, it takes me a while to really get going",
    example: "For example, when the teacher gives you a new activity, does it take you a while before you actually start working on it?",
    type: 'rating',
    options: [1, 2, 3, 4],
    reverse: false
  },
  {
    id: 12,
    subscale: 'focusing',
    question: "When the teacher explains something, I find it difficult to understand and write it down at the same time",
    kidFriendlyQuestion: "It's hard to listen to the teacher and write at the same time",
    example: "For example, when the teacher is explaining something and you also need to write it down, can you do both at once or do you miss things?",
    type: 'rating',
    options: [1, 2, 3, 4],
    reverse: false
  },
  {
    id: 20,
    subscale: 'focusing',
    question: "I find it difficult to let go my own way of thinking about something, and to look at it in a different way",
    kidFriendlyQuestion: "It's hard for me to think about things in a new way",
    example: "For example, if you always solve a problem one way and someone shows you a different way, is it hard to try the new way?",
    type: 'rating',
    options: [1, 2, 3, 4],
    reverse: false
  },
  // ATTENTIONAL SHIFTING SUBSCALE
  {
    id: 10,
    subscale: 'shifting',
    question: "When I am doing something, I can easily stop and switch to some other task",
    kidFriendlyQuestion: "I can stop what I'm doing and start something else easily",
    example: "For example, if you're drawing and the teacher says it's time for reading, can you switch right away without getting upset?",
    type: 'rating',
    options: [1, 2, 3, 4],
    reverse: true
  },
  {
    id: 13,
    subscale: 'shifting',
    question: "When it is necessary, I can become interested in a new topic very quickly",
    kidFriendlyQuestion: "I can get excited about new things fast when I need to",
    example: "For example, if the teacher starts a new topic you didn't expect, can you get interested in it quickly?",
    type: 'rating',
    options: [1, 2, 3, 4],
    reverse: true
  },
  {
    id: 14,
    subscale: 'shifting',
    question: "It is easy for me to read or write, while I am also talking to someone on the telephone",
    kidFriendlyQuestion: "I can do my work while talking to someone at the same time",
    example: "For example, doing your homework while chatting with a friend, can you do both without messing up?",
    type: 'rating',
    options: [1, 2, 3, 4],
    reverse: true
  },
  {
    id: 17,
    subscale: 'shifting',
    question: "After being interrupted or distracted, I can easily shift my attention back to what I was doing before",
    kidFriendlyQuestion: "When someone stops me, I can go back to what I was doing easily",
    example: "For example, if someone asks you a question while you're working, can you answer and then get right back to your work?",
    type: 'rating',
    options: [1, 2, 3, 4],
    reverse: true
  },
  {
    id: 18,
    subscale: 'shifting',
    question: "When I am daydreaming or having distracting thoughts, it is easy for me to switch back to the work I have to do",
    kidFriendlyQuestion: "When I daydream, I can get back to my work easily",
    example: "For example, if your mind drifts off during class, can you snap back and keep working, or is it hard to focus again?",
    type: 'rating',
    options: [1, 2, 3, 4],
    reverse: true
  },
  {
    id: 19,
    subscale: 'shifting',
    question: "It is easy for me to switch back and forth between two different tasks",
    kidFriendlyQuestion: "I can jump between two things easily",
    example: "For example, going back and forth between reading and writing, can you switch without getting confused?",
    type: 'rating',
    options: [1, 2, 3, 4],
    reverse: true
  }
];

export const ratingLabels = {
  1: "Almost Never",
  2: "Sometimes", 
  3: "Often",
  4: "Always"
};

export const kidFriendlyRatingLabels = {
  1: "Never",
  2: "Sometimes", 
  3: "Often",
  4: "Always"
};

/**
 * Calculate attention scores from responses
 */
export const calculateAttentionScores = (responses: Record<number, number>) => {
  let focusingScore = 0;
  let shiftingScore = 0;
  let focusingCount = 0;
  let shiftingCount = 0;

  attentionControlQuestions.forEach(question => {
    const response = responses[question.id];
    if (response !== undefined) {
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
    focusing: { raw: focusingScore, average: focusingAverage, count: focusingCount },
    shifting: { raw: shiftingScore, average: shiftingAverage, count: shiftingCount },
    total: { raw: totalScore, percentage: percentageScore, possible: totalPossible }
  };
};

/**
 * Interpret scores based on research
 */
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

/**
 * Get recommendations based on interpretation
 */
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
