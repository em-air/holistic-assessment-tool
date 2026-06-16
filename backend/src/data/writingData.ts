/**
 * Backend Quiz Data - Writing Prompts
 * 
 * Writing prompts and rubrics by grade level.
 * Note: Writing doesn't have "answers" per se - it's evaluated by AI.
 * This data is safe to serve to the frontend as prompts.
 */

export interface WritingTopic {
  id: string;
  title: string;
  prompt: string;
  description: string;
  wordCount: {
    min: number;
    max: number;
  };
  criteria: string[];
}

export interface WritingRubricLevel {
  excellent: string;
  good: string;
  needs_improvement: string;
}

export interface GradeWritingData {
  grade: number;
  topics: WritingTopic[];
  skillFocus: string[];
  rubric: Record<string, WritingRubricLevel>;
}

export const writingData: GradeWritingData[] = [
  {
    grade: 1,
    topics: [
      {
        id: "grade1-topic1",
        title: "My Favorite Animal",
        prompt: "Write about your favorite animal. What does it look like? What does it do?",
        description: "Draw a picture in your mind and write 2-3 sentences about an animal you love.",
        wordCount: { min: 10, max: 25 },
        criteria: ["Uses capital letters", "Uses periods", "Writes complete thoughts", "Stays on topic"]
      },
      {
        id: "grade1-topic2",
        title: "My Family",
        prompt: "Tell me about your family. Who lives in your house?",
        description: "Write about the people in your family and what they like to do.",
        wordCount: { min: 10, max: 25 },
        criteria: ["Uses capital letters", "Uses periods", "Writes complete thoughts", "Stays on topic"]
      },
      {
        id: "grade1-topic3",
        title: "What I Like to Do",
        prompt: "What is your favorite thing to do? Tell me about it!",
        description: "Write about an activity you enjoy doing at home or school.",
        wordCount: { min: 10, max: 25 },
        criteria: ["Uses capital letters", "Uses periods", "Writes complete thoughts", "Stays on topic"]
      }
    ],
    skillFocus: ["Capital letters", "Periods", "Simple sentences", "Spelling familiar words"],
    rubric: {
      "Capitalization": {
        excellent: "Uses capital letters correctly at the beginning of sentences and for names",
        good: "Uses some capital letters correctly",
        needs_improvement: "Needs help with capital letters"
      },
      "Punctuation": {
        excellent: "Uses periods correctly at the end of sentences",
        good: "Uses some periods correctly",
        needs_improvement: "Needs help with periods"
      },
      "Ideas": {
        excellent: "Writes clear, complete thoughts that stay on topic",
        good: "Writes mostly complete thoughts",
        needs_improvement: "Needs help writing complete thoughts"
      },
      "Spelling": {
        excellent: "Spells familiar words correctly",
        good: "Spells some words correctly",
        needs_improvement: "Needs help with spelling"
      }
    }
  },
  {
    grade: 2,
    topics: [
      {
        id: "grade2-topic1",
        title: "My Best Day Ever",
        prompt: "Write about the best day you ever had. What made it so special?",
        description: "Tell the story of an amazing day from beginning to end.",
        wordCount: { min: 25, max: 50 },
        criteria: ["Clear beginning and ending", "Uses descriptive words", "Correct punctuation", "Proper spelling"]
      },
      {
        id: "grade2-topic2",
        title: "If I Could Fly",
        prompt: "Imagine you could fly anywhere. Where would you go and what would you see?",
        description: "Use your imagination to write about flying to different places.",
        wordCount: { min: 25, max: 50 },
        criteria: ["Creative ideas", "Uses descriptive words", "Correct punctuation", "Proper spelling"]
      },
      {
        id: "grade2-topic3",
        title: "A Special Friend",
        prompt: "Write about a special friend. What makes them special to you?",
        description: "Describe your friend and tell why they are important to you.",
        wordCount: { min: 25, max: 50 },
        criteria: ["Clear description", "Uses descriptive words", "Correct punctuation", "Proper spelling"]
      }
    ],
    skillFocus: ["Descriptive words", "Story sequence", "Basic punctuation", "Sight word spelling"],
    rubric: {
      "Organization": {
        excellent: "Writing has a clear beginning, middle, and end",
        good: "Writing has some organization",
        needs_improvement: "Needs help organizing ideas"
      },
      "Word Choice": {
        excellent: "Uses interesting and descriptive words",
        good: "Uses some descriptive words",
        needs_improvement: "Needs to use more descriptive words"
      },
      "Mechanics": {
        excellent: "Uses correct punctuation and capitalization",
        good: "Uses mostly correct punctuation and capitalization",
        needs_improvement: "Needs help with punctuation and capitalization"
      },
      "Spelling": {
        excellent: "Spells most words correctly",
        good: "Spells many words correctly",
        needs_improvement: "Needs help with spelling"
      }
    }
  },
  {
    grade: 3,
    topics: [
      {
        id: "grade3-topic1",
        title: "My Hero",
        prompt: "Write about someone you think is a hero. Why do you admire this person?",
        description: "Explain what makes someone a hero and describe your hero's qualities.",
        wordCount: { min: 50, max: 100 },
        criteria: ["Clear main idea", "Supporting details", "Good paragraph structure", "Varied sentence types"]
      },
      {
        id: "grade3-topic2",
        title: "The Perfect School Day",
        prompt: "Describe what your perfect school day would be like from start to finish.",
        description: "Plan out an ideal school day with activities, subjects, and fun events.",
        wordCount: { min: 50, max: 100 },
        criteria: ["Logical organization", "Transition words", "Good paragraph structure", "Varied sentence types"]
      },
      {
        id: "grade3-topic3",
        title: "An Adventure in the Forest",
        prompt: "Imagine you're exploring a magical forest. What do you discover?",
        description: "Write a creative story about your forest adventure and what you find.",
        wordCount: { min: 50, max: 100 },
        criteria: ["Creative story", "Descriptive details", "Good paragraph structure", "Varied sentence types"]
      }
    ],
    skillFocus: ["Paragraph structure", "Topic sentences", "Supporting details", "Transition words"],
    rubric: {
      "Ideas and Content": {
        excellent: "Clear main idea with strong supporting details",
        good: "Good main idea with some supporting details",
        needs_improvement: "Needs clearer main idea and more details"
      },
      "Organization": {
        excellent: "Well-organized with good paragraph structure",
        good: "Mostly organized with some paragraph structure",
        needs_improvement: "Needs better organization and paragraph structure"
      },
      "Word Choice": {
        excellent: "Uses varied and interesting vocabulary",
        good: "Uses some varied vocabulary",
        needs_improvement: "Needs to use more varied vocabulary"
      },
      "Conventions": {
        excellent: "Few errors in spelling, punctuation, and grammar",
        good: "Some errors in spelling, punctuation, and grammar",
        needs_improvement: "Many errors in spelling, punctuation, and grammar"
      }
    }
  },
  {
    grade: 4,
    topics: [
      {
        id: "grade4-topic1",
        title: "A Place I'd Like to Visit",
        prompt: "Choose a place you've never been but would like to visit. Explain why you want to go there and what you would do.",
        description: "Write a persuasive paragraph about a destination and your reasons for wanting to visit.",
        wordCount: { min: 100, max: 150 },
        criteria: ["Strong topic sentence", "Multiple supporting reasons", "Descriptive language", "Concluding sentence"]
      },
      {
        id: "grade4-topic2",
        title: "An Important Lesson",
        prompt: "Think of a time when you learned something important. What happened and what did you learn?",
        description: "Share a personal experience and the valuable lesson you gained from it.",
        wordCount: { min: 100, max: 150 },
        criteria: ["Clear narrative structure", "Specific details", "Reflection on learning", "Engaging conclusion"]
      },
      {
        id: "grade4-topic3",
        title: "Invention for the Future",
        prompt: "Invent something that would help people in the future. Describe what it does and how it helps.",
        description: "Use your creativity to design a helpful invention and explain its benefits.",
        wordCount: { min: 100, max: 150 },
        criteria: ["Creative thinking", "Clear explanation", "Detailed description", "Logical reasoning"]
      }
    ],
    skillFocus: ["Multi-paragraph writing", "Evidence and examples", "Voice and style", "Revision skills"],
    rubric: {
      "Focus and Ideas": {
        excellent: "Clear focus with well-developed ideas and strong examples",
        good: "Good focus with developed ideas and examples",
        needs_improvement: "Needs clearer focus and more developed ideas"
      },
      "Organization": {
        excellent: "Strong organization with smooth transitions",
        good: "Good organization with some transitions",
        needs_improvement: "Needs better organization and transitions"
      },
      "Voice and Style": {
        excellent: "Engaging voice with varied sentence structure",
        good: "Some voice with mostly varied sentences",
        needs_improvement: "Needs more voice and sentence variety"
      },
      "Conventions": {
        excellent: "Strong control of spelling, grammar, and punctuation",
        good: "Good control with minor errors",
        needs_improvement: "Needs improvement in spelling, grammar, and punctuation"
      }
    }
  },
  {
    grade: 5,
    topics: [
      {
        id: "grade5-topic1",
        title: "Should Students Choose Their Classes?",
        prompt: "Do you think elementary students should be allowed to choose some of their classes? Write an essay explaining your opinion.",
        description: "Take a position and support it with at least three reasons and examples.",
        wordCount: { min: 150, max: 250 },
        criteria: ["Clear thesis statement", "Multiple supporting arguments", "Use of evidence", "Counter-argument consideration"]
      },
      {
        id: "grade5-topic2",
        title: "A Character Who Changed",
        prompt: "Think of a character from a book or movie who changed throughout the story. Explain how and why they changed.",
        description: "Analyze character development using specific examples from the text or film.",
        wordCount: { min: 150, max: 250 },
        criteria: ["Character analysis", "Text evidence", "Clear examples", "Insightful conclusions"]
      },
      {
        id: "grade5-topic3",
        title: "Protecting Our Environment",
        prompt: "What is one thing kids your age can do to help protect the environment? Convince others to join you.",
        description: "Write a persuasive essay about an environmental action and why it's important.",
        wordCount: { min: 150, max: 250 },
        criteria: ["Persuasive arguments", "Supporting evidence", "Call to action", "Environmental awareness"]
      }
    ],
    skillFocus: ["Opinion writing", "Research skills", "Citations", "Advanced vocabulary"],
    rubric: {
      "Thesis and Focus": {
        excellent: "Clear, strong thesis with consistent focus throughout",
        good: "Good thesis with mostly consistent focus",
        needs_improvement: "Needs clearer thesis and better focus"
      },
      "Support and Evidence": {
        excellent: "Strong support with relevant evidence and examples",
        good: "Good support with some evidence and examples",
        needs_improvement: "Needs more support and stronger evidence"
      },
      "Organization": {
        excellent: "Logical organization with effective transitions",
        good: "Good organization with some transitions",
        needs_improvement: "Needs better organization and smoother transitions"
      },
      "Language and Style": {
        excellent: "Sophisticated vocabulary with varied sentence structure",
        good: "Good vocabulary with some sentence variety",
        needs_improvement: "Needs more sophisticated vocabulary and sentence variety"
      }
    }
  },
  {
    grade: 6,
    topics: [
      {
        id: "grade6-topic1",
        title: "Technology: Help or Harm?",
        prompt: "Write an argumentative essay about whether technology helps or harms young people today. Use specific examples to support your position.",
        description: "Research and present a well-reasoned argument about technology's impact on youth.",
        wordCount: { min: 250, max: 400 },
        criteria: ["Strong argument structure", "Credible evidence", "Addresses counterarguments", "Formal writing style"]
      },
      {
        id: "grade6-topic2",
        title: "If I Could Solve One World Problem",
        prompt: "Choose one major world problem and explain how you would solve it. What steps would you take?",
        description: "Propose a realistic solution to a global issue with detailed action steps.",
        wordCount: { min: 250, max: 400 },
        criteria: ["Problem identification", "Feasible solutions", "Step-by-step planning", "Global awareness"]
      },
      {
        id: "grade6-topic3",
        title: "The Power of Friendship",
        prompt: "How do friendships change as you grow older? Compare elementary friendships with middle school friendships.",
        description: "Analyze how friendships evolve and what causes these changes.",
        wordCount: { min: 250, max: 400 },
        criteria: ["Comparative analysis", "Personal reflection", "Insightful observations", "Clear examples"]
      }
    ],
    skillFocus: ["Argumentative structure", "Research integration", "Formal tone", "Complex sentences"],
    rubric: {
      "Argument and Claims": {
        excellent: "Clear, compelling argument with well-supported claims",
        good: "Good argument with supported claims",
        needs_improvement: "Needs stronger argument and better support for claims"
      },
      "Evidence and Analysis": {
        excellent: "Strong evidence with thorough analysis and interpretation",
        good: "Good evidence with some analysis",
        needs_improvement: "Needs stronger evidence and deeper analysis"
      },
      "Organization and Structure": {
        excellent: "Sophisticated organization with seamless transitions",
        good: "Good organization with effective transitions",
        needs_improvement: "Needs better organization and smoother transitions"
      },
      "Language and Conventions": {
        excellent: "Advanced vocabulary with error-free conventions",
        good: "Good vocabulary with minor convention errors",
        needs_improvement: "Needs more advanced vocabulary and better conventions"
      }
    }
  },
  {
    grade: 7,
    topics: [
      {
        id: "grade7-topic1",
        title: "The Impact of Social Media",
        prompt: "Analyze how social media affects teenagers today. Discuss both positive and negative impacts with specific examples.",
        description: "Write a balanced analysis examining multiple perspectives on social media's influence.",
        wordCount: { min: 400, max: 600 },
        criteria: ["Balanced analysis", "Multiple perspectives", "Strong evidence", "Sophisticated reasoning"]
      },
      {
        id: "grade7-topic2",
        title: "A Moment That Changed Everything",
        prompt: "Write a narrative essay about a specific moment or event that significantly changed your perspective or life direction.",
        description: "Craft a compelling personal narrative with reflection on growth and change.",
        wordCount: { min: 400, max: 600 },
        criteria: ["Engaging narrative voice", "Vivid descriptions", "Reflection and insight", "Strong conclusion"]
      },
      {
        id: "grade7-topic3",
        title: "Education in the Digital Age",
        prompt: "How has technology changed education, and what does the future of learning look like?",
        description: "Analyze current educational technology and predict future developments.",
        wordCount: { min: 400, max: 600 },
        criteria: ["Critical analysis", "Future predictions", "Educational insight", "Technology understanding"]
      }
    ],
    skillFocus: ["Advanced analysis", "Multiple perspectives", "Sophisticated vocabulary", "Research skills"],
    rubric: {
      "Critical Thinking": {
        excellent: "Demonstrates sophisticated critical thinking and analysis",
        good: "Shows good critical thinking with some analysis",
        needs_improvement: "Needs stronger critical thinking and deeper analysis"
      },
      "Development and Support": {
        excellent: "Ideas are thoroughly developed with compelling support",
        good: "Ideas are well developed with good support",
        needs_improvement: "Needs better development and stronger support"
      },
      "Style and Voice": {
        excellent: "Distinctive voice with sophisticated style",
        good: "Clear voice with good style",
        needs_improvement: "Needs stronger voice and more sophisticated style"
      },
      "Mechanics and Usage": {
        excellent: "Excellent control of grammar, usage, and mechanics",
        good: "Good control with few errors",
        needs_improvement: "Needs improvement in grammar, usage, and mechanics"
      }
    }
  },
  {
    grade: 8,
    topics: [
      {
        id: "grade8-topic1",
        title: "Leadership in the 21st Century",
        prompt: "What qualities make an effective leader in today's world? Support your argument with examples from history, current events, or personal experience.",
        description: "Develop a sophisticated argument about modern leadership qualities with diverse evidence.",
        wordCount: { min: 500, max: 800 },
        criteria: ["Sophisticated thesis", "Diverse evidence sources", "Complex analysis", "Mature writing style"]
      },
      {
        id: "grade8-topic2",
        title: "The Power of Literature",
        prompt: "How can literature help us understand ourselves and others better? Use specific examples from books you've read to support your argument.",
        description: "Explore literature's impact on empathy and self-understanding with textual analysis.",
        wordCount: { min: 500, max: 800 },
        criteria: ["Literary analysis", "Textual evidence", "Thematic connections", "Scholarly tone"]
      },
      {
        id: "grade8-topic3",
        title: "Climate Change: Our Generation's Challenge",
        prompt: "What role should young people play in addressing climate change? Develop a comprehensive plan of action.",
        description: "Create a detailed argument about youth involvement in climate action with specific proposals.",
        wordCount: { min: 500, max: 800 },
        criteria: ["Environmental understanding", "Action-oriented solutions", "Global perspective", "Urgent tone"]
      }
    ],
    skillFocus: ["Complex argumentation", "Synthesis of sources", "Advanced vocabulary", "Academic writing style"],
    rubric: {
      "Sophistication of Ideas": {
        excellent: "Demonstrates mature, sophisticated thinking with complex ideas",
        good: "Shows good thinking with well-developed ideas",
        needs_improvement: "Needs more sophisticated and complex thinking"
      },
      "Use of Evidence": {
        excellent: "Masterful use of varied, credible evidence",
        good: "Good use of credible evidence",
        needs_improvement: "Needs stronger and more varied evidence"
      },
      "Academic Style": {
        excellent: "Mature academic style with sophisticated language",
        good: "Good academic style with appropriate language",
        needs_improvement: "Needs more mature academic style and language"
      },
      "Technical Proficiency": {
        excellent: "Error-free writing with advanced sentence structure",
        good: "Few errors with good sentence structure",
        needs_improvement: "Needs improvement in technical writing skills"
      }
    }
  }
];

/**
 * Get writing data for a specific grade
 */
export const getWritingDataByGrade = (grade: number): GradeWritingData | undefined => {
  return writingData.find(data => data.grade === grade);
};

/**
 * Get a random topic for a grade
 */
export const getRandomWritingTopic = (grade: number): WritingTopic | undefined => {
  const gradeData = getWritingDataByGrade(grade);
  if (!gradeData) return undefined;
  
  const randomIndex = Math.floor(Math.random() * gradeData.topics.length);
  return gradeData.topics[randomIndex];
};

/**
 * Get available grades for writing
 */
export const getWritingGrades = (): { grade: number; skillFocus: string[] }[] => {
  return writingData.map(g => ({
    grade: g.grade,
    skillFocus: g.skillFocus,
  }));
};
