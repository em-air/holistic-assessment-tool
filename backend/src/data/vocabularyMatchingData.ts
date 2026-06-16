export interface VocabularyMatchingQuestion {
  id: string;
  word: string;
  definition: string;
}

export interface VocabularyMatchingLevelSummary {
  level: number;
  questionCount: number;
}

export interface VocabularyMatchingGradeSummary {
  grade: number;
  levels: VocabularyMatchingLevelSummary[];
}

type VocabularyMatchingData = Record<number, Record<number, VocabularyMatchingQuestion[]>>;

const vocabularyMatchingData: VocabularyMatchingData = {
  4: {
    1: [
      { id: '4-1-1', word: 'Abundant', definition: 'Present in large quantities; plentiful' },
      { id: '4-1-2', word: 'Cautious', definition: 'Careful to avoid danger or mistakes' },
      { id: '4-1-3', word: 'Emerge', definition: 'To come out into view or existence' },
      { id: '4-1-4', word: 'Fragile', definition: 'Easily broken or damaged; delicate' },
      { id: '4-1-5', word: 'Grasp', definition: 'To understand or hold firmly' },
    ],
    2: [
      { id: '4-2-1', word: 'Humble', definition: 'Not proud; modest and respectful' },
      { id: '4-2-2', word: 'Inquire', definition: 'To ask questions; to investigate' },
      { id: '4-2-3', word: 'Loyal', definition: 'Faithful and devoted to someone or something' },
      { id: '4-2-4', word: 'Mighty', definition: 'Very strong or powerful' },
      { id: '4-2-5', word: 'Notice', definition: 'To become aware of or observe' },
    ],
    3: [
      { id: '4-3-1', word: 'Peaceful', definition: 'Free from disturbance; calm and quiet' },
      { id: '4-3-2', word: 'Rapid', definition: 'Happening very quickly; fast' },
      { id: '4-3-3', word: 'Sturdy', definition: 'Strong and well-built; durable' },
      { id: '4-3-4', word: 'Timid', definition: 'Shy and lacking confidence' },
      { id: '4-3-5', word: 'Vivid', definition: 'Very bright and clear; intense' },
    ],
  },
  5: {
    1: [
      { id: '5-1-1', word: 'Analyze', definition: 'To examine in detail to understand better' },
      { id: '5-1-2', word: 'Chronic', definition: 'Continuing for a long time; persistent' },
      { id: '5-1-3', word: 'Diverse', definition: 'Showing variety; different from each other' },
      { id: '5-1-4', word: 'Emphasize', definition: 'To give special importance or attention to' },
      { id: '5-1-5', word: 'Formulate', definition: 'To create or develop systematically' },
    ],
    2: [
      { id: '5-2-1', word: 'Interpret', definition: 'To explain the meaning of something' },
      { id: '5-2-2', word: 'Navigate', definition: 'To find one\'s way through or around' },
      { id: '5-2-3', word: 'Obstacles', definition: 'Things that block progress or movement' },
      { id: '5-2-4', word: 'Preliminary', definition: 'Coming before the main event; introductory' },
      { id: '5-2-5', word: 'Reliable', definition: 'Consistently good; dependable' },
    ],
    3: [
      { id: '5-3-1', word: 'Significant', definition: 'Important; having great meaning or effect' },
      { id: '5-3-2', word: 'Transform', definition: 'To change completely in form or appearance' },
      { id: '5-3-3', word: 'Ultimate', definition: 'Final; most extreme or important' },
      { id: '5-3-4', word: 'Vivacious', definition: 'Full of life and energy; lively' },
      { id: '5-3-5', word: 'Wander', definition: 'To walk aimlessly; to move without purpose' },
    ],
  },
  6: {
    1: [
      { id: '6-1-1', word: 'Comprehend', definition: 'To understand fully; to grasp mentally' },
      { id: '6-1-2', word: 'Distinguish', definition: 'To recognize differences between things' },
      { id: '6-1-3', word: 'Elaborate', definition: 'To explain in more detail; to expand upon' },
      { id: '6-1-4', word: 'Flourish', definition: 'To grow well; to be successful' },
      { id: '6-1-5', word: 'Gradually', definition: 'Happening slowly over time' },
    ],
    2: [
      { id: '6-2-1', word: 'Inevitable', definition: 'Certain to happen; unavoidable' },
      { id: '6-2-2', word: 'Justify', definition: 'To show or prove to be right or reasonable' },
      { id: '6-2-3', word: 'Meticulous', definition: 'Very careful and precise; paying attention to details' },
      { id: '6-2-4', word: 'Precise', definition: 'Exact and accurate in details' },
      { id: '6-2-5', word: 'Scrutinize', definition: 'To examine closely and carefully' },
    ],
    3: [
      { id: '6-3-1', word: 'Spontaneous', definition: 'Done without planning; happening naturally' },
      { id: '6-3-2', word: 'Tangible', definition: 'Real and concrete; able to be touched' },
      { id: '6-3-3', word: 'Versatile', definition: 'Able to adapt to many different uses' },
      { id: '6-3-4', word: 'Wholesome', definition: 'Good for health and well-being' },
      { id: '6-3-5', word: 'Zealous', definition: 'Having great energy and enthusiasm' },
    ],
  },
  7: {
    1: [
      { id: '7-1-1', word: 'Advocate', definition: 'To publicly support or recommend' },
      { id: '7-1-2', word: 'Benevolent', definition: 'Kind and generous; showing goodwill' },
      { id: '7-1-3', word: 'Contemplate', definition: 'To think deeply about something' },
      { id: '7-1-4', word: 'Deteriorate', definition: 'To become worse in quality or condition' },
      { id: '7-1-5', word: 'Eloquent', definition: 'Fluent and persuasive in speaking or writing' },
    ],
    2: [
      { id: '7-2-1', word: 'Hypothesis', definition: 'A proposed explanation for something' },
      { id: '7-2-2', word: 'Innovative', definition: 'Introducing new ideas; creative' },
      { id: '7-2-3', word: 'Perpetual', definition: 'Never ending; continuing forever' },
      { id: '7-2-4', word: 'Resilient', definition: 'Able to recover quickly from difficulties' },
      { id: '7-2-5', word: 'Skeptical', definition: 'Doubtful; questioning the truth of something' },
    ],
    3: [
      { id: '7-3-1', word: 'Tenacious', definition: 'Holding firmly to something; persistent' },
      { id: '7-3-2', word: 'Unanimous', definition: 'Agreed by everyone; with no opposition' },
      { id: '7-3-3', word: 'Vindicate', definition: 'To clear of blame or suspicion' },
      { id: '7-3-4', word: 'Whimsical', definition: 'Playful and unpredictable; fanciful' },
      { id: '7-3-5', word: 'Zephyr', definition: 'A gentle, mild breeze' },
    ],
  },
  8: {
    1: [
      { id: '8-1-1', word: 'Ambiguous', definition: 'Having more than one possible meaning; unclear' },
      { id: '8-1-2', word: 'Collaborate', definition: 'To work together on a project' },
      { id: '8-1-3', word: 'Discern', definition: 'To perceive or recognize clearly' },
      { id: '8-1-4', word: 'Exemplify', definition: 'To be a typical example of something' },
      { id: '8-1-5', word: 'Fluctuate', definition: 'To change irregularly; to vary' },
    ],
    2: [
      { id: '8-2-1', word: 'Imperative', definition: 'Extremely important; essential' },
      { id: '8-2-2', word: 'Juxtapose', definition: 'To place side by side for comparison' },
      { id: '8-2-3', word: 'Lucid', definition: 'Clear and easy to understand' },
      { id: '8-2-4', word: 'Meander', definition: 'To wander aimlessly; to follow a winding path' },
      { id: '8-2-5', word: 'Nuance', definition: 'A subtle difference in meaning or expression' },
    ],
    3: [
      { id: '8-3-1', word: 'Synthesis', definition: 'The combination of parts into a coherent whole' },
      { id: '8-3-2', word: 'Tangential', definition: 'Only slightly related; diverging from the main point' },
      { id: '8-3-3', word: 'Ubiquitous', definition: 'Present everywhere; widespread' },
      { id: '8-3-4', word: 'Validate', definition: 'To confirm the accuracy or worth of something' },
      { id: '8-3-5', word: 'Zenith', definition: 'The highest point; the peak of achievement' },
    ],
  },
};

export const getVocabularyMatchingGrades = (): VocabularyMatchingGradeSummary[] =>
  Object.entries(vocabularyMatchingData)
    .map(([grade, levels]) => ({
      grade: Number(grade),
      levels: Object.entries(levels)
        .map(([level, questions]) => ({
          level: Number(level),
          questionCount: questions.length,
        }))
        .sort((left, right) => left.level - right.level),
    }))
    .sort((left, right) => left.grade - right.grade);

export const getVocabularyMatchingQuestions = (
  grade: number,
  level: number,
): VocabularyMatchingQuestion[] => {
  const questions = vocabularyMatchingData[grade]?.[level] ?? [];
  return questions.map((question) => ({ ...question }));
};