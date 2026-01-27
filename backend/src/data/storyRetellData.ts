/**
 * Backend Quiz Data - Story Retell
 * 
 * Stories with multiple choice options for beginning, middle, and end.
 * SECURITY: Correct answers are not exposed until submission.
 */

export interface StoryRetellOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface StoryRetellQuestion {
  id: number;
  title: string;
  story: string;
  grade: number;
  readingLevel: 'beginner' | 'intermediate' | 'advanced';
  wordCount: number;
  beginningOptions: StoryRetellOption[];
  middleOptions: StoryRetellOption[];
  endOptions: StoryRetellOption[];
}

// Grade 1 Stories
export const grade1Stories: StoryRetellQuestion[] = [
  {
    id: 1,
    title: "The Lost Puppy",
    story: `One sunny morning, Emma found a small brown puppy in her backyard. The puppy looked sad and hungry. Emma gave the puppy some food and water. She made a sign that said "Found Puppy" and put it on her mailbox. The next day, a family came to Emma's house. They were so happy to find their lost puppy! The puppy wagged its tail and licked their faces. Emma felt proud that she helped the puppy find its family.`,
    grade: 1,
    readingLevel: 'beginner',
    wordCount: 87,
    beginningOptions: [
      { id: 'b1', text: 'Emma found a sad puppy in her backyard.', isCorrect: true },
      { id: 'b2', text: 'Emma bought a new puppy at a pet store.', isCorrect: false },
      { id: 'b3', text: 'Emma lost her puppy in the park.', isCorrect: false }
    ],
    middleOptions: [
      { id: 'm1', text: 'Emma gave the puppy food and made a sign.', isCorrect: true },
      { id: 'm2', text: 'Emma took the puppy to the vet.', isCorrect: false },
      { id: 'm3', text: 'Emma played with the puppy all day.', isCorrect: false }
    ],
    endOptions: [
      { id: 'e1', text: "The puppy's family found it and Emma was proud.", isCorrect: true },
      { id: 'e2', text: 'Emma kept the puppy as her own pet.', isCorrect: false },
      { id: 'e3', text: 'The puppy ran away again.', isCorrect: false }
    ]
  },
  {
    id: 2,
    title: "The Magic Paintbrush",
    story: `Tim loved to paint. One day, he found a special paintbrush at the art store. When Tim painted a red apple, it became real! He could eat it. Tim was amazed. He painted a blue bird, and it flew around his room. Then Tim painted flowers for his mom. The flowers smelled wonderful. Tim learned that his new paintbrush could make beautiful things come to life.`,
    grade: 1,
    readingLevel: 'beginner',
    wordCount: 72,
    beginningOptions: [
      { id: 'b1', text: 'Tim found a special paintbrush at the store.', isCorrect: true },
      { id: 'b2', text: 'Tim got a new paintbrush for his birthday.', isCorrect: false },
      { id: 'b3', text: 'Tim made a paintbrush from sticks.', isCorrect: false }
    ],
    middleOptions: [
      { id: 'm1', text: 'The things Tim painted became real.', isCorrect: true },
      { id: 'm2', text: 'Tim painted pictures for his art class.', isCorrect: false },
      { id: 'm3', text: 'Tim broke his new paintbrush.', isCorrect: false }
    ],
    endOptions: [
      { id: 'e1', text: 'Tim learned his paintbrush made things come alive.', isCorrect: true },
      { id: 'e2', text: 'Tim returned the paintbrush to the store.', isCorrect: false },
      { id: 'e3', text: 'Tim threw away the old paintbrush.', isCorrect: false }
    ]
  }
];

// Grade 2 Stories
export const grade2Stories: StoryRetellQuestion[] = [
  {
    id: 3,
    title: "The School Play",
    story: `Maya wanted to be in the school play, but she was very shy. During auditions, Maya's hands shook and her voice was quiet. The teacher smiled kindly and asked Maya to try again. Maya took a deep breath and sang her favorite song. Her voice grew stronger and more confident. The teacher clapped and said Maya would be perfect for the lead role! On the night of the play, Maya's family cheered loudly.`,
    grade: 2,
    readingLevel: 'beginner',
    wordCount: 82,
    beginningOptions: [
      { id: 'b1', text: 'Maya wanted to be in the school play but felt shy.', isCorrect: true },
      { id: 'b2', text: 'Maya was excited to be the star of the play.', isCorrect: false },
      { id: 'b3', text: "Maya didn't want to try out for the play.", isCorrect: false }
    ],
    middleOptions: [
      { id: 'm1', text: 'Maya was nervous at first but sang better when she tried again.', isCorrect: true },
      { id: 'm2', text: 'Maya forgot her lines and ran off the stage.', isCorrect: false },
      { id: 'm3', text: 'Maya decided not to audition after all.', isCorrect: false }
    ],
    endOptions: [
      { id: 'e1', text: 'Maya got the lead role and performed for her family.', isCorrect: true },
      { id: 'e2', text: "Maya didn't get a part in the play.", isCorrect: false },
      { id: 'e3', text: 'Maya quit the play because she was too scared.', isCorrect: false }
    ]
  }
];

// Grade 3 Stories
export const grade3Stories: StoryRetellQuestion[] = [
  {
    id: 4,
    title: "The Science Fair Project",
    story: `Marcus wanted to win the science fair with an amazing project about volcanoes. He spent weeks building a model volcano with his dad. The day before the fair, Marcus tested his volcano, but it didn't work right. The "lava" barely bubbled. Marcus felt frustrated and thought about giving up. His dad reminded him that scientists fail many times before they succeed. They stayed up late fixing the problem. The next day at the science fair, Marcus's volcano erupted perfectly! He got a special award for "Best Scientific Process."`,
    grade: 3,
    readingLevel: 'intermediate',
    wordCount: 98,
    beginningOptions: [
      { id: 'b1', text: 'Marcus spent weeks building a volcano project with his dad for the science fair.', isCorrect: true },
      { id: 'b2', text: 'Marcus quickly made a volcano the night before the science fair.', isCorrect: false },
      { id: 'b3', text: 'Marcus decided to enter the science fair at the last minute.', isCorrect: false }
    ],
    middleOptions: [
      { id: 'm1', text: 'The volcano failed when tested, but Marcus and his dad worked late to fix it.', isCorrect: true },
      { id: 'm2', text: 'The volcano worked perfectly on the first try without any problems.', isCorrect: false },
      { id: 'm3', text: 'Marcus gave up and decided to build a different project instead.', isCorrect: false }
    ],
    endOptions: [
      { id: 'e1', text: 'The volcano worked at the fair and Marcus won a special award.', isCorrect: true },
      { id: 'e2', text: 'Marcus won first place for having the best volcano project.', isCorrect: false },
      { id: 'e3', text: "The volcano still didn't work and Marcus was disappointed.", isCorrect: false }
    ]
  }
];

// Grade 4 Stories
export const grade4Stories: StoryRetellQuestion[] = [
  {
    id: 5,
    title: "The Time Capsule",
    story: `When the old library was being renovated, workers discovered a metal box hidden in the wall. The box had "1925" engraved on it. Ten-year-old Zara convinced the mayor to let her class open the time capsule. Inside, they found old photographs, newspapers, and a diary written by a girl named Margaret who lived 100 years ago. Zara realized they had a lot in common. The class decided to create their own time capsule for future students, and Zara felt connected to the past.`,
    grade: 4,
    readingLevel: 'advanced',
    wordCount: 92,
    beginningOptions: [
      { id: 'b1', text: 'Workers found a time capsule from 1925 during library renovations, and Zara asked to open it.', isCorrect: true },
      { id: 'b2', text: "Zara's class found a time capsule while cleaning the library shelves.", isCorrect: false },
      { id: 'b3', text: 'The mayor discovered an old time capsule and gave it to Zara.', isCorrect: false }
    ],
    middleOptions: [
      { id: 'm1', text: "Inside was Margaret's diary from 100 years ago, and Zara discovered they had similar interests.", isCorrect: true },
      { id: 'm2', text: 'Zara read about Margaret and decided to write a book about her story.', isCorrect: false },
      { id: 'm3', text: "The diary belonged to Zara's great-grandmother.", isCorrect: false }
    ],
    endOptions: [
      { id: 'e1', text: 'The class created a new time capsule, and Zara felt connected to the past.', isCorrect: true },
      { id: 'e2', text: "Zara donated Margaret's diary to a museum.", isCorrect: false },
      { id: 'e3', text: 'Zara became a librarian like Margaret.', isCorrect: false }
    ]
  }
];

/**
 * Get all stories by grade
 */
export const getStoriesByGrade = (grade: number): StoryRetellQuestion[] => {
  switch (grade) {
    case 1: return grade1Stories;
    case 2: return grade2Stories;
    case 3: return grade3Stories;
    case 4: return grade4Stories;
    default: return grade1Stories;
  }
};

/**
 * Get story for frontend (with options shuffled)
 */
export const getStoryForFrontend = (storyId: number): {
  id: number;
  title: string;
  story: string;
  grade: number;
  readingLevel: string;
  wordCount: number;
  beginningOptions: { id: string; text: string }[];
  middleOptions: { id: string; text: string }[];
  endOptions: { id: string; text: string }[];
} | undefined => {
  const allStories = [...grade1Stories, ...grade2Stories, ...grade3Stories, ...grade4Stories];
  const story = allStories.find(s => s.id === storyId);
  if (!story) return undefined;
  
  // Return options without isCorrect flag
  return {
    id: story.id,
    title: story.title,
    story: story.story,
    grade: story.grade,
    readingLevel: story.readingLevel,
    wordCount: story.wordCount,
    beginningOptions: story.beginningOptions.map(o => ({ id: o.id, text: o.text })).sort(() => Math.random() - 0.5),
    middleOptions: story.middleOptions.map(o => ({ id: o.id, text: o.text })).sort(() => Math.random() - 0.5),
    endOptions: story.endOptions.map(o => ({ id: o.id, text: o.text })).sort(() => Math.random() - 0.5),
  };
};

/**
 * Validate story retell answers
 */
export const validateStoryRetellAnswers = (
  storyId: number,
  answers: { beginningId: string; middleId: string; endId: string }
): {
  beginningCorrect: boolean;
  middleCorrect: boolean;
  endCorrect: boolean;
  totalCorrect: number;
  correctAnswers: { beginning: string; middle: string; end: string };
} => {
  const allStories = [...grade1Stories, ...grade2Stories, ...grade3Stories, ...grade4Stories];
  const story = allStories.find(s => s.id === storyId);
  
  if (!story) {
    return {
      beginningCorrect: false,
      middleCorrect: false,
      endCorrect: false,
      totalCorrect: 0,
      correctAnswers: { beginning: '', middle: '', end: '' }
    };
  }
  
  const beginningCorrect = story.beginningOptions.find(o => o.id === answers.beginningId)?.isCorrect || false;
  const middleCorrect = story.middleOptions.find(o => o.id === answers.middleId)?.isCorrect || false;
  const endCorrect = story.endOptions.find(o => o.id === answers.endId)?.isCorrect || false;
  
  return {
    beginningCorrect,
    middleCorrect,
    endCorrect,
    totalCorrect: [beginningCorrect, middleCorrect, endCorrect].filter(Boolean).length,
    correctAnswers: {
      beginning: story.beginningOptions.find(o => o.isCorrect)?.text || '',
      middle: story.middleOptions.find(o => o.isCorrect)?.text || '',
      end: story.endOptions.find(o => o.isCorrect)?.text || '',
    }
  };
};
