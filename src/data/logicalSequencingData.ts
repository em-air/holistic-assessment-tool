export interface SequencingQuestion {
  id: number;
  title: string;
  sentences: string[];
  correctOrder: number[]; // Array of indices representing correct order
  grade: number;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  hint?: string;
}

export interface SequencingQuizResult {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timePerQuestion: number[];
  totalTime: number;
  percentage: number;
  grade: number;
}

// Grade 1: 3-sentence stories
export const grade1Questions: SequencingQuestion[] = [
  {
    id: 1,
    title: "Making a Sandwich",
    sentences: [
      "I eat my delicious sandwich.",
      "I get bread and peanut butter.",
      "I spread peanut butter on the bread."
    ],
    correctOrder: [1, 2, 0], // Get bread -> Spread -> Eat
    grade: 1,
    difficulty: 'easy',
    topic: 'daily-activities',
    hint: "What do you do first when making food?"
  },
  {
    id: 2,
    title: "Getting Ready for School",
    sentences: [
      "I walk to school.",
      "I wake up in the morning.",
      "I put on my clothes and backpack."
    ],
    correctOrder: [1, 2, 0], // Wake up -> Get dressed -> Walk to school
    grade: 1,
    difficulty: 'easy',
    topic: 'daily-activities',
    hint: "What happens first in the morning?"
  },
  {
    id: 3,
    title: "Planting a Seed",
    sentences: [
      "The plant grows tall.",
      "I put the seed in the dirt.",
      "I water the seed every day."
    ],
    correctOrder: [1, 2, 0], // Plant seed -> Water -> Grows
    grade: 1,
    difficulty: 'easy',
    topic: 'nature',
    hint: "What do you do first with a seed?"
  },
  {
    id: 4,
    title: "Brushing Teeth",
    sentences: [
      "I rinse my mouth with water.",
      "I put toothpaste on my toothbrush.",
      "I brush my teeth for two minutes."
    ],
    correctOrder: [1, 2, 0], // Put toothpaste -> Brush -> Rinse
    grade: 1,
    difficulty: 'easy',
    topic: 'daily-activities',
    hint: "What goes on the toothbrush first?"
  },
  {
    id: 5,
    title: "Building with Blocks",
    sentences: [
      "I play with my tall tower.",
      "I get my blocks from the toy box.",
      "I stack the blocks to make a tower."
    ],
    correctOrder: [1, 2, 0], // Get blocks -> Stack -> Play
    grade: 1,
    difficulty: 'medium',
    topic: 'play',
    hint: "Where do the blocks come from?"
  }
];

// Grade 2: 4-sentence stories
export const grade2Questions: SequencingQuestion[] = [
  {
    id: 6,
    title: "Baking Cookies",
    sentences: [
      "We mix all the ingredients together.",
      "We eat the warm, tasty cookies.",
      "We put the cookies in the oven to bake.",
      "We gather flour, sugar, and eggs."
    ],
    correctOrder: [3, 0, 2, 1], // Gather -> Mix -> Bake -> Eat
    grade: 2,
    difficulty: 'easy',
    topic: 'cooking',
    hint: "What ingredients do you need first?"
  },
  {
    id: 7,
    title: "Going to the Library",
    sentences: [
      "I read my books at home.",
      "I walk to the library.",
      "I check out books with my library card.",
      "I choose books I want to read."
    ],
    correctOrder: [1, 3, 2, 0], // Walk -> Choose -> Check out -> Read at home
    grade: 2,
    difficulty: 'easy',
    topic: 'community',
    hint: "How do you get to the library?"
  },
  {
    id: 8,
    title: "Washing the Dog",
    sentences: [
      "I dry the dog with a big towel.",
      "I get soap and water ready.",
      "The dog is clean and fluffy.",
      "I wash the dog with soap and water."
    ],
    correctOrder: [1, 3, 0, 2], // Get ready -> Wash -> Dry -> Clean result
    grade: 2,
    difficulty: 'medium',
    topic: 'pet-care',
    hint: "What do you need before washing?"
  },
  {
    id: 9,
    title: "Growing a Garden",
    sentences: [
      "I plant seeds in the prepared soil.",
      "I harvest vegetables when they're ready.",
      "I water the plants and pull weeds.",
      "I prepare the soil by digging."
    ],
    correctOrder: [3, 0, 2, 1], // Prepare soil -> Plant -> Care -> Harvest
    grade: 2,
    difficulty: 'medium',
    topic: 'gardening',
    hint: "What must you do to the ground first?"
  },
  {
    id: 10,
    title: "Making a Paper Airplane",
    sentences: [
      "I throw the airplane and watch it fly.",
      "I fold the paper in half lengthwise.",
      "I get a piece of paper.",
      "I fold the corners to make wings."
    ],
    correctOrder: [2, 1, 3, 0], // Get paper -> Fold half -> Make wings -> Fly
    grade: 2,
    difficulty: 'hard',
    topic: 'crafts',
    hint: "What do you need before you can fold?"
  }
];

// Grade 3: 5-sentence stories
export const grade3Questions: SequencingQuestion[] = [
  {
    id: 11,
    title: "Planning a Birthday Party",
    sentences: [
      "Everyone arrives and we play games.",
      "I make a list of friends to invite.",
      "We blow out candles and eat cake.",
      "I send invitations to my friends.",
      "I decorate the house with balloons."
    ],
    correctOrder: [1, 3, 4, 0, 2], // List -> Invite -> Decorate -> Party -> Cake
    grade: 3,
    difficulty: 'easy',
    topic: 'social-events',
    hint: "What's the first step in planning any event?"
  },
  {
    id: 12,
    title: "Learning to Ride a Bike",
    sentences: [
      "I practice riding with someone holding the bike.",
      "I fall down a few times but keep trying.",
      "I put on my helmet for safety.",
      "Finally, I can ride all by myself!",
      "I get on the bike and put my feet on the pedals."
    ],
    correctOrder: [2, 4, 0, 1, 3], // Helmet -> Get on -> Practice -> Fall/try -> Success
    grade: 3,
    difficulty: 'medium',
    topic: 'learning',
    hint: "What should you always wear for safety?"
  },
  {
    id: 13,
    title: "Scientific Experiment",
    sentences: [
      "I write down what happened in my notebook.",
      "I gather materials: vinegar, baking soda, and a bottle.",
      "The mixture bubbles and foams everywhere!",
      "I make a prediction about what will happen.",
      "I carefully mix the vinegar and baking soda."
    ],
    correctOrder: [1, 3, 4, 2, 0], // Gather -> Predict -> Mix -> Result -> Record
    grade: 3,
    difficulty: 'medium',
    topic: 'science',
    hint: "What do scientists gather before starting?"
  },
  {
    id: 14,
    title: "Preparing for a Camping Trip",
    sentences: [
      "We pack our sleeping bags and food in the car.",
      "We set up our tent at the campsite.",
      "We make a checklist of things we need.",
      "We drive to the campground in the mountains.",
      "We roast marshmallows around the campfire."
    ],
    correctOrder: [2, 0, 3, 1, 4], // Checklist -> Pack -> Drive -> Setup -> Enjoy
    grade: 3,
    difficulty: 'hard',
    topic: 'outdoor-activities',
    hint: "What helps you remember what to bring?"
  },
  {
    id: 15,
    title: "Writing a Story",
    sentences: [
      "I brainstorm ideas for my story.",
      "I edit my story to fix mistakes.",
      "I write the first draft of my story.",
      "I share my finished story with friends.",
      "I make an outline of the main events."
    ],
    correctOrder: [0, 4, 2, 1, 3], // Brainstorm -> Outline -> Draft -> Edit -> Share
    grade: 3,
    difficulty: 'hard',
    topic: 'writing',
    hint: "Where do all good stories begin?"
  }
];

// Grade 4: 6-sentence stories
export const grade4Questions: SequencingQuestion[] = [
  {
    id: 16,
    title: "Organizing a School Fundraiser",
    sentences: [
      "We count the money raised and announce the total.",
      "We brainstorm ideas for raising money for new playground equipment.",
      "Students and families participate in our car wash event.",
      "We advertise our car wash around the neighborhood.",
      "We gather supplies like soap, sponges, and buckets.",
      "We set up stations for washing, rinsing, and drying cars."
    ],
    correctOrder: [1, 4, 5, 3, 2, 0], // Brainstorm -> Gather -> Setup -> Advertise -> Event -> Results
    grade: 4,
    difficulty: 'medium',
    topic: 'community-service',
    hint: "What's the first step in any project?"
  },
  {
    id: 17,
    title: "Creating a Science Fair Project",
    sentences: [
      "I present my project to the judges and explain my findings.",
      "I choose a question: 'Which type of soil helps plants grow best?'",
      "I analyze my data and draw conclusions.",
      "I conduct the experiment by planting seeds in different soils.",
      "I research information about soil types and plant growth.",
      "I create charts and graphs to display my results."
    ],
    correctOrder: [1, 4, 3, 2, 5, 0], // Question -> Research -> Experiment -> Analyze -> Display -> Present
    grade: 4,
    difficulty: 'hard',
    topic: 'science-fair',
    hint: "Every good experiment starts with what?"
  },
  {
    id: 18,
    title: "Planning and Cooking a Family Dinner",
    sentences: [
      "Everyone enjoys the delicious meal together.",
      "I decide on a menu: spaghetti, salad, and garlic bread.",
      "I serve the food on nice plates and call everyone to dinner.",
      "I make a shopping list of all the ingredients I need.",
      "I cook each dish carefully, following the recipes.",
      "I shop for ingredients at the grocery store."
    ],
    correctOrder: [1, 3, 5, 4, 2, 0], // Menu -> List -> Shop -> Cook -> Serve -> Enjoy
    grade: 4,
    difficulty: 'medium',
    topic: 'cooking',
    hint: "What do you decide before making a shopping list?"
  },
  {
    id: 19,
    title: "Training for a Marathon",
    sentences: [
      "I successfully complete the 26-mile marathon race!",
      "I decide to challenge myself by running a marathon.",
      "I follow a training schedule, gradually increasing my distance.",
      "I create a 16-week training plan with daily running goals.",
      "I register for the marathon and mark the date on my calendar.",
      "I prepare for race day by eating well and getting enough sleep."
    ],
    correctOrder: [1, 3, 4, 2, 5, 0], // Decide -> Plan -> Register -> Train -> Prepare -> Complete
    grade: 4,
    difficulty: 'hard',
    topic: 'athletics',
    hint: "What comes first - the decision or the plan?"
  },
  {
    id: 20,
    title: "Building a Treehouse",
    sentences: [
      "We invite friends over to play in our amazing new treehouse.",
      "We design plans and measure the tree to see what size treehouse will fit.",
      "We gather tools and materials: wood, nails, hammers, and rope.",
      "We add finishing touches like a rope ladder and wooden rails for safety.",
      "We carefully construct the floor, walls, and roof of the treehouse.",
      "We choose a strong, healthy tree in our backyard."
    ],
    correctOrder: [5, 1, 2, 4, 3, 0], // Choose tree -> Design -> Gather -> Build -> Finish -> Enjoy
    grade: 4,
    difficulty: 'hard',
    topic: 'construction',
    hint: "What do you need before you can design plans?"
  }
];

export const getAllQuestions = (): SequencingQuestion[] => {
  return [...grade1Questions, ...grade2Questions, ...grade3Questions, ...grade4Questions];
};

export const getQuestionsByGrade = (grade: number): SequencingQuestion[] => {
  switch (grade) {
    case 1:
      return grade1Questions;
    case 2:
      return grade2Questions;
    case 3:
      return grade3Questions;
    case 4:
      return grade4Questions;
    default:
      return grade1Questions;
  }
};

export const getQuestionsByGradeAndCount = (grade: number, count: number): SequencingQuestion[] => {
  const questions = getQuestionsByGrade(grade);
  return questions.slice(0, count);
};