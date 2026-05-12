import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  ListOrdered,
  Lock,
  MessageSquare,
  Pencil,
  Target,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import FloatingBackground from '../components/FloatingBackground';
import { useAuth } from '../contexts/AuthContext';
import {
  canAccessQuizGrade,
  getCategoryBlockedMessage,
  getLockedReason,
  getNumericGrade,
} from '../utils/gradeUtils';
import {
  ROUTES,
  categoryRoute,
  logicalSequencingGradeRoute,
  oralSentenceBuildingGradeRoute,
  oralStoryRetellGradeRoute,
  spellingTestRoute,
  writingTestRoute,
} from '../routes';
import {
  getSentenceBuildingGrades,
  type SentenceBuildingGradeSummary,
} from '../services/sentenceBuildingService';
import { getSpellingGrades, type SpellingGradeInfo } from '../services/spellingService';
import { getWritingGrades, type WritingGradeSummary } from '../services/writingQuizService';

type GradeSelectorId =
  | 'story-retell'
  | 'sentence-building'
  | 'logical-sequencing'
  | 'spelling'
  | 'writing';

interface GradeSelectorCardStat {
  label: string;
  value: string | number;
}

interface GradeSelectorInstruction {
  title: string;
  description: string;
  badgeClass: string;
}

interface GradeSelectorFeatureItem {
  icon: string;
  title: string;
  description: string;
}

interface GradeSelectorCard {
  grade: number;
  title: string;
  description: string;
  gradientClass: string;
  difficulty?: string;
  badgeClass?: string;
  summary?: string;
  bulletsTitle?: string;
  bullets?: string[];
  stats?: GradeSelectorCardStat[];
  chips?: string[];
  overflowChipLabel?: string;
  hoverLabel?: string;
  icon?: LucideIcon;
  iconContainerClass?: string;
}

interface GradeSelectorFeaturePanel {
  title: string;
  items: GradeSelectorFeatureItem[];
}

interface GradeSelectorConfig {
  id: GradeSelectorId;
  paths: string[];
  title: string;
  description: string;
  icon: LucideIcon;
  iconContainerClass: string;
  pageBackgroundClass: string;
  backRoute: string;
  backButtonClass: string;
  showTopBackButton?: boolean;
  showBottomBackButton?: boolean;
  bottomBackButtonLabel?: string;
  restrictionNoticeClass: string;
  restrictionTextClass: string;
  restrictionEmoji: string;
  cardHoverBorderClass: string;
  summaryPanelClass: string;
  summaryTextClass: string;
  bulletDotClass: string;
  gridClassName?: string;
  accessCategory: string;
  accessSubcategory: string;
  routeForGrade: (grade: number) => string;
  loadingTitle: string;
  emptyStateTitle: string;
  emptyStateMessage: string;
  instructionsTitle?: string;
  instructions?: GradeSelectorInstruction[];
  featurePanel?: GradeSelectorFeaturePanel;
  cards?: GradeSelectorCard[];
  loadCards?: () => Promise<GradeSelectorCard[]>;
  getCategoryBlockedMessage?: (userGrade: number | null) => string | null;
  getLockReason?: (userGrade: number | null, quizGrade: number, isAdmin: boolean) => string | null;
}

const difficultyBadgeClassByGrade = (grade: number): string => {
  if (grade === 1) return 'bg-green-500';
  if (grade === 2) return 'bg-blue-500';
  if (grade === 3) return 'bg-purple-500';
  return 'bg-red-500';
};

const getWritingDifficultyLabel = (grade: number): string => {
  if (grade <= 2) return 'Beginner';
  if (grade <= 5) return 'Developing';
  if (grade <= 6) return 'Structured';
  return 'Advanced';
};

const getWritingDescription = (grade: number): string => {
  if (grade <= 2) return 'Simple sentences and basic writing';
  if (grade <= 5) return 'Paragraphs and story writing';
  if (grade <= 6) return 'Essays and opinion writing';
  return 'Advanced analysis and research writing';
};

const getWritingGradientClass = (grade: number): string => {
  if (grade <= 2) return 'from-pink-400 to-pink-600';
  if (grade <= 5) return 'from-blue-400 to-blue-600';
  if (grade <= 6) return 'from-green-400 to-green-600';
  return 'from-purple-400 to-purple-600';
};

const getWritingIcon = (grade: number): LucideIcon => {
  if (grade <= 2) return Pencil;
  if (grade <= 5) return BookOpen;
  if (grade <= 6) return Users;
  return Target;
};

const getWritingIconContainerClass = (grade: number): string => {
  if (grade <= 2) return 'bg-pink-500';
  if (grade <= 5) return 'bg-blue-500';
  if (grade <= 6) return 'bg-green-500';
  return 'bg-purple-500';
};

const storyRetellCards: GradeSelectorCard[] = [
  {
    grade: 1,
    title: 'Grade 1',
    description: 'Simple stories with clear beginning-middle-end',
    difficulty: 'Beginner',
    gradientClass: 'from-green-400 to-blue-500',
    badgeClass: 'bg-green-500',
    summary: '70-90 words',
    bulletsTitle: 'Sample Stories:',
    bullets: ['The Lost Puppy', 'The Magic Paintbrush', 'The Cookie Monster'],
    stats: [
      { label: 'Stories', value: 3 },
      { label: 'Sections', value: 3 },
      { label: 'Minutes', value: '~10' },
    ],
  },
  {
    grade: 2,
    title: 'Grade 2',
    description: 'Stories with character development and emotions',
    difficulty: 'Easy',
    gradientClass: 'from-blue-400 to-purple-500',
    badgeClass: 'bg-blue-500',
    summary: '90-110 words',
    bulletsTitle: 'Sample Stories:',
    bullets: ['The School Play', 'The Garden Helper', 'The Rainy Day Race'],
    stats: [
      { label: 'Stories', value: 3 },
      { label: 'Sections', value: 3 },
      { label: 'Minutes', value: '~11' },
    ],
  },
  {
    grade: 3,
    title: 'Grade 3',
    description: 'Complex plots with problem-solving themes',
    difficulty: 'Medium',
    gradientClass: 'from-purple-400 to-pink-500',
    badgeClass: 'bg-purple-500',
    summary: '130-150 words',
    bulletsTitle: 'Sample Stories:',
    bullets: ['The Science Fair Project', 'The New Student', 'The Championship Game'],
    stats: [
      { label: 'Stories', value: 3 },
      { label: 'Sections', value: 3 },
      { label: 'Minutes', value: '~12' },
    ],
  },
  {
    grade: 4,
    title: 'Grade 4',
    description: 'Advanced narratives with themes and lessons',
    difficulty: 'Advanced',
    gradientClass: 'from-pink-400 to-red-500',
    badgeClass: 'bg-red-500',
    summary: '180-300 words',
    bulletsTitle: 'Sample Stories:',
    bullets: ['The Time Capsule', 'The Community Garden', 'The Storm and the Stranger'],
    stats: [
      { label: 'Stories', value: 3 },
      { label: 'Sections', value: 3 },
      { label: 'Minutes', value: '~13' },
    ],
  },
];

const logicalSequencingCards: GradeSelectorCard[] = [
  {
    grade: 1,
    title: 'Grade 1',
    description: '3-sentence stories about daily activities',
    difficulty: 'Beginner',
    gradientClass: 'from-green-400 to-blue-500',
    badgeClass: 'bg-green-500',
    summary: '3-sentence stories',
    bulletsTitle: 'Story Examples:',
    bullets: ['Feeding a pet', 'Washing hands', 'Drawing a picture'],
    stats: [
      { label: 'Sentences', value: 3 },
      { label: 'Questions', value: 5 },
      { label: 'Minutes', value: '~5' },
    ],
  },
  {
    grade: 2,
    title: 'Grade 2',
    description: '4-sentence stories with more steps',
    difficulty: 'Easy',
    gradientClass: 'from-blue-400 to-purple-500',
    badgeClass: 'bg-blue-500',
    summary: '4-sentence stories',
    bulletsTitle: 'Story Examples:',
    bullets: ['Baking cookies', 'Going to library', 'Washing the dog'],
    stats: [
      { label: 'Sentences', value: 4 },
      { label: 'Questions', value: 5 },
      { label: 'Minutes', value: '~6' },
    ],
  },
  {
    grade: 3,
    title: 'Grade 3',
    description: '5-sentence stories with planning steps',
    difficulty: 'Medium',
    gradientClass: 'from-purple-400 to-pink-500',
    badgeClass: 'bg-purple-500',
    summary: '5-sentence stories',
    bulletsTitle: 'Story Examples:',
    bullets: ['Planning a party', 'Learning to ride a bike', 'Science experiment'],
    stats: [
      { label: 'Sentences', value: 5 },
      { label: 'Questions', value: 5 },
      { label: 'Minutes', value: '~7' },
    ],
  },
  {
    grade: 4,
    title: 'Grade 4',
    description: '6-sentence complex multi-step processes',
    difficulty: 'Advanced',
    gradientClass: 'from-pink-400 to-red-500',
    badgeClass: 'bg-red-500',
    summary: '6-sentence stories',
    bulletsTitle: 'Story Examples:',
    bullets: ['School fundraiser', 'Science fair project', 'Training for marathon'],
    stats: [
      { label: 'Sentences', value: 6 },
      { label: 'Questions', value: 5 },
      { label: 'Minutes', value: '~8' },
    ],
  },
];

const mapSentenceBuildingGrades = (
  grades: SentenceBuildingGradeSummary[],
): GradeSelectorCard[] =>
  grades.map((grade) => ({
    grade: grade.grade,
    title: grade.title,
    description: grade.description,
    difficulty: grade.difficulty,
    gradientClass: grade.color,
    badgeClass: difficultyBadgeClassByGrade(grade.grade),
    summary: `${grade.questionCount} questions`,
    stats: [
      { label: 'Questions', value: grade.questionCount },
      { label: 'Minutes', value: `~${grade.grade + 4}` },
    ],
  }));

const mapSpellingGrades = (grades: SpellingGradeInfo[]): GradeSelectorCard[] =>
  grades.map((grade) => ({
    grade: grade.grade,
    title: `Grade ${grade.grade}`,
    description: grade.description,
    gradientClass: 'from-blue-400 to-indigo-500',
    summary: `${grade.wordCount} words`,
    hoverLabel: '→ Start Test',
  }));

const mapWritingGrades = (grades: WritingGradeSummary[]): GradeSelectorCard[] =>
  grades.map((grade) => ({
    grade: grade.grade,
    title: `Grade ${grade.grade}`,
    description: getWritingDescription(grade.grade),
    difficulty: getWritingDifficultyLabel(grade.grade),
    badgeClass: difficultyBadgeClassByGrade(grade.grade),
    gradientClass: getWritingGradientClass(grade.grade),
    summary: `${grade.topicCount} writing topics`,
    stats: [
      { label: 'Words', value: `${grade.wordCount.min}-${grade.wordCount.max}` },
      { label: 'Skills', value: grade.skillFocus.length },
    ],
    chips: grade.skillFocus.slice(0, 2),
    overflowChipLabel: grade.skillFocus.length > 2 ? `+${grade.skillFocus.length - 2} more` : undefined,
    hoverLabel: '→ Start Writing',
    icon: getWritingIcon(grade.grade),
    iconContainerClass: getWritingIconContainerClass(grade.grade),
  }));

const selectorConfigs: GradeSelectorConfig[] = [
  {
    id: 'story-retell',
    paths: [ROUTES.ORAL_STORY_RETELL, ROUTES.STORY_RETELL_QUIZ_FLAT],
    title: 'Story Retell',
    description: 'Read short stories and retell them using Beginning, Middle, and End structure. Practice identifying key characters and main events.',
    icon: BookOpen,
    iconContainerClass: 'bg-gradient-to-r from-blue-500 to-indigo-600',
    pageBackgroundClass: 'bg-gradient-to-b from-blue-100 to-indigo-100',
    backRoute: categoryRoute('oral-skills'),
    backButtonClass: 'text-white bg-black/20 hover:bg-black/30',
    restrictionNoticeClass: 'bg-blue-50 border border-blue-200',
    restrictionTextClass: 'text-blue-700',
    restrictionEmoji: '📖',
    cardHoverBorderClass: 'group-hover:border-blue-300',
    summaryPanelClass: 'bg-blue-50',
    summaryTextClass: 'text-blue-700',
    bulletDotClass: 'bg-blue-400',
    accessCategory: 'oral',
    accessSubcategory: 'story-retell',
    routeForGrade: oralStoryRetellGradeRoute,
    loadingTitle: 'Loading story retell grades...',
    emptyStateTitle: 'Story Retell Unavailable',
    emptyStateMessage: 'Story retell grades are unavailable right now.',
    instructionsTitle: 'How Story Retell Works',
    instructions: [
      {
        title: 'Read the Story',
        description: 'Read the story carefully and pay attention to characters and events',
        badgeClass: 'bg-green-500',
      },
      {
        title: 'Retell in 3 Parts',
        description: 'Write what happened in the beginning, middle, and end',
        badgeClass: 'bg-blue-500',
      },
      {
        title: 'Include Key Details',
        description: 'Mention important characters and main events',
        badgeClass: 'bg-purple-500',
      },
    ],
    cards: storyRetellCards,
  },
  {
    id: 'sentence-building',
    paths: [ROUTES.ORAL_SENTENCE_BUILDING],
    title: 'Sentence Building',
    description: 'Build sentences from pictures! Start with simple identification and progress to complex sentence construction and inference.',
    icon: MessageSquare,
    iconContainerClass: 'bg-green-500',
    pageBackgroundClass: 'bg-gradient-to-b from-green-100 to-emerald-100',
    backRoute: categoryRoute('oral-skills'),
    backButtonClass: 'text-white bg-black/20 hover:bg-black/30',
    restrictionNoticeClass: 'bg-green-50 border border-green-200',
    restrictionTextClass: 'text-green-700',
    restrictionEmoji: '💬',
    cardHoverBorderClass: 'group-hover:border-green-300',
    summaryPanelClass: 'bg-green-50',
    summaryTextClass: 'text-green-700',
    bulletDotClass: 'bg-green-400',
    accessCategory: 'oral',
    accessSubcategory: 'oral-language',
    routeForGrade: oralSentenceBuildingGradeRoute,
    loadingTitle: 'Loading sentence building grades...',
    emptyStateTitle: 'Sentence Building Unavailable',
    emptyStateMessage: 'Sentence building grades are unavailable right now.',
    instructionsTitle: 'How Sentence Building Works',
    instructions: [
      {
        title: 'Look at the Picture',
        description: 'Carefully observe the image and think about what you see',
        badgeClass: 'bg-green-500',
      },
      {
        title: 'Read the Question',
        description: 'Understand what is being asked about the picture',
        badgeClass: 'bg-blue-500',
      },
      {
        title: 'Choose the Best Answer',
        description: 'Pick the sentence that best matches the picture',
        badgeClass: 'bg-purple-500',
      },
    ],
    loadCards: async () => mapSentenceBuildingGrades(await getSentenceBuildingGrades()),
  },
  {
    id: 'logical-sequencing',
    paths: [ROUTES.PERCEPTION_LOGICAL_SEQ, ROUTES.LOGICAL_SEQUENCING_GRADES],
    title: 'Logical Sequencing',
    description: 'Arrange sentences in the correct order to tell a complete story. Drag and drop the sentences to create logical sequences.',
    icon: ListOrdered,
    iconContainerClass: 'bg-gradient-to-r from-purple-500 to-pink-600',
    pageBackgroundClass: 'bg-purple-50',
    backRoute: ROUTES.PERCEPTION_SELECTION,
    backButtonClass: 'text-gray-700 bg-white/60 hover:bg-white/80',
    restrictionNoticeClass: 'bg-purple-50 border border-purple-200',
    restrictionTextClass: 'text-purple-700',
    restrictionEmoji: '🧩',
    cardHoverBorderClass: 'group-hover:border-purple-300',
    summaryPanelClass: 'bg-purple-50',
    summaryTextClass: 'text-purple-700',
    bulletDotClass: 'bg-purple-400',
    accessCategory: 'mind',
    accessSubcategory: 'logical-sequencing',
    routeForGrade: logicalSequencingGradeRoute,
    loadingTitle: 'Loading logical sequencing grades...',
    emptyStateTitle: 'Logical Sequencing Unavailable',
    emptyStateMessage: 'Logical sequencing grades are unavailable right now.',
    instructionsTitle: 'How Logical Sequencing Works',
    instructions: [
      {
        title: 'Read All Sentences',
        description: 'Read each sentence carefully before you start moving anything',
        badgeClass: 'bg-purple-500',
      },
      {
        title: 'Arrange the Order',
        description: 'Drag the sentences until the story flows in a logical order',
        badgeClass: 'bg-pink-500',
      },
      {
        title: 'Submit Your Sequence',
        description: 'Check whether your order tells a complete and sensible story',
        badgeClass: 'bg-indigo-500',
      },
    ],
    cards: logicalSequencingCards,
  },
  {
    id: 'spelling',
    paths: [ROUTES.SPELLING_GRADES],
    title: 'Spelling Test',
    description: 'Choose your grade level to start the spelling test. Each grade has words appropriate for that level.',
    icon: Pencil,
    iconContainerClass: 'bg-blue-500',
    pageBackgroundClass: 'bg-blue-50',
    backRoute: ROUTES.CATEGORY_ACADEMIC_SKILLS,
    backButtonClass: 'text-gray-700 bg-white/70 hover:bg-white/90',
    showTopBackButton: false,
    showBottomBackButton: true,
    bottomBackButtonLabel: 'Back to Academic Tests',
    restrictionNoticeClass: 'bg-blue-50 border border-blue-200',
    restrictionTextClass: 'text-blue-700',
    restrictionEmoji: '📝',
    cardHoverBorderClass: 'group-hover:border-purple-300',
    summaryPanelClass: 'bg-blue-50',
    summaryTextClass: 'text-purple-600',
    bulletDotClass: 'bg-blue-400',
    gridClassName: 'grid grid-cols-2 md:grid-cols-4 gap-6 mb-8',
    accessCategory: 'academic',
    accessSubcategory: 'spelling',
    routeForGrade: spellingTestRoute,
    loadingTitle: 'Loading spelling grades...',
    emptyStateTitle: 'Spelling Grades Unavailable',
    emptyStateMessage: 'Unable to load spelling grades right now.',
    loadCards: async () => mapSpellingGrades(await getSpellingGrades()),
    getCategoryBlockedMessage: (userGrade) => getCategoryBlockedMessage(userGrade, 'academic'),
    getLockReason: (userGrade, quizGrade, isAdmin) =>
      getLockedReason(userGrade, 'academic', 'spelling', quizGrade, isAdmin),
  },
  {
    id: 'writing',
    paths: [ROUTES.WRITING_GRADES],
    title: 'Writing Assessment',
    description: 'Choose your grade level to start writing! Each grade has different topics and writing goals.',
    icon: Pencil,
    iconContainerClass: 'bg-purple-500',
    pageBackgroundClass: 'bg-blue-50',
    backRoute: ROUTES.CATEGORY_ACADEMIC_SKILLS,
    backButtonClass: 'text-gray-700 bg-white/70 hover:bg-white/90',
    showTopBackButton: false,
    showBottomBackButton: true,
    bottomBackButtonLabel: 'Back to Academic Tests',
    restrictionNoticeClass: 'bg-purple-50 border border-purple-200',
    restrictionTextClass: 'text-purple-700',
    restrictionEmoji: '✍️',
    cardHoverBorderClass: 'group-hover:border-purple-300',
    summaryPanelClass: 'bg-purple-50',
    summaryTextClass: 'text-purple-700',
    bulletDotClass: 'bg-purple-400',
    gridClassName: 'grid grid-cols-2 md:grid-cols-4 gap-6 mb-8',
    accessCategory: 'academic',
    accessSubcategory: 'writing',
    routeForGrade: writingTestRoute,
    loadingTitle: 'Loading writing grades...',
    emptyStateTitle: 'Writing Grades Unavailable',
    emptyStateMessage: 'The writing assessment metadata could not be loaded.',
    loadCards: async () => mapWritingGrades(await getWritingGrades()),
    getCategoryBlockedMessage: (userGrade) => getCategoryBlockedMessage(userGrade, 'academic'),
    featurePanel: {
      title: "What's Included:",
      items: [
        {
          icon: '📝',
          title: 'Writing Prompts',
          description: 'Age-appropriate topics that spark creativity',
        },
        {
          icon: '📊',
          title: 'Smart Evaluation',
          description: 'Grade-specific rubrics and feedback',
        },
        {
          icon: '🎯',
          title: 'Skill Building',
          description: 'Focus on grade-level writing skills',
        },
      ],
    },
  },
];

const SharedGradeSelectorPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { grade: userGrade, isAdmin, user } = useAuth();
  const userNumericGrade = getNumericGrade(userGrade);
  const config = selectorConfigs.find((candidate) => candidate.paths.includes(location.pathname));

  const [cards, setCards] = useState<GradeSelectorCard[]>(config?.cards ?? []);
  const [isLoading, setIsLoading] = useState(Boolean(config?.loadCards));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!config) {
      setCards([]);
      setIsLoading(false);
      setLoadError('This grade selector is unavailable.');
      return;
    }

    if (!config.loadCards) {
      const nextCards = config.cards ?? [];
      setCards(nextCards);
      setIsLoading(false);
      setLoadError(nextCards.length === 0 ? config.emptyStateMessage : null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);

    const loadCards = async () => {
      const loadedCards = await config.loadCards();
      if (!isMounted) {
        return;
      }

      setCards(loadedCards);
      setIsLoading(false);
      setLoadError(loadedCards.length === 0 ? config.emptyStateMessage : null);
    };

    void loadCards();

    return () => {
      isMounted = false;
    };
  }, [config, reloadToken]);

  if (!config) {
    return (
      <div className="min-h-screen bg-slate-100 relative overflow-hidden p-6">
        <FloatingBackground />
        <div className="max-w-3xl mx-auto relative z-10 flex min-h-[70vh] items-center justify-center">
          <div className="rounded-3xl bg-white p-8 text-center shadow-lg">
            <h1 className="mb-3 text-2xl font-bold text-gray-800">Grade Selector Not Found</h1>
            <p className="mb-6 text-gray-600">The requested grade selector could not be resolved.</p>
            <button
              onClick={() => navigate(ROUTES.CATEGORIES)}
              className="inline-flex items-center rounded-xl bg-gray-200 px-6 py-3 font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Categories
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleGradeSelect = (grade: number) => {
    if (!user) {
      navigate(ROUTES.AUTH);
      return;
    }

    if (canAccessQuizGrade(userNumericGrade, config.accessCategory, config.accessSubcategory, grade, isAdmin)) {
      navigate(config.routeForGrade(grade));
    }
  };

  const isGradeLocked = (grade: number): boolean => {
    if (!user) {
      return true;
    }

    return !canAccessQuizGrade(userNumericGrade, config.accessCategory, config.accessSubcategory, grade, isAdmin);
  };

  const handleRetry = () => {
    setReloadToken((currentValue) => currentValue + 1);
  };

  const HeaderIcon = config.icon;
  const categoryBlockedMessage = config.getCategoryBlockedMessage?.(userNumericGrade) ?? null;
  const gridClassName = config.gridClassName ?? 'grid grid-cols-1 md:grid-cols-2 gap-8 mb-12';
  const showTopBackButton = config.showTopBackButton ?? true;
  const showBottomBackButton = config.showBottomBackButton ?? false;

  if (isLoading) {
    return (
      <div className={`min-h-screen relative overflow-hidden ${config.pageBackgroundClass}`}>
        <FloatingBackground />
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="rounded-3xl bg-white p-8 text-center shadow-lg">
            <div className="mb-4 text-5xl">{config.restrictionEmoji}</div>
            <h2 className="text-2xl font-bold text-gray-800">{config.loadingTitle}</h2>
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={`min-h-screen relative overflow-hidden ${config.pageBackgroundClass}`}>
        <FloatingBackground />
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="max-w-xl rounded-3xl bg-white p-8 text-center shadow-lg">
            <div className="mb-4 text-5xl">{config.restrictionEmoji}</div>
            <h2 className="mb-3 text-2xl font-bold text-gray-800">{config.emptyStateTitle}</h2>
            <p className="mb-6 text-gray-600">{loadError}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {config.loadCards && (
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center justify-center rounded-xl bg-blue-500 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-blue-600"
                >
                  Retry
                </button>
              )}
              <button
                onClick={() => navigate(config.backRoute)}
                className="inline-flex items-center justify-center rounded-xl bg-gray-200 px-6 py-3 font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-300"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative overflow-hidden ${config.pageBackgroundClass}`}>
      <FloatingBackground />

      {showTopBackButton && (
        <div className="absolute top-4 left-4 z-20">
          <button
            onClick={() => navigate(config.backRoute)}
            className={`group flex items-center space-x-2 px-4 py-2 backdrop-blur-sm rounded-lg transition-all duration-300 ease-out hover:shadow-md transform hover:scale-105 ${config.backButtonClass}`}
          >
            <ArrowLeft size={20} className="transform group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">back</span>
          </button>
        </div>
      )}

      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-6xl w-full relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="mb-6">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 ${config.iconContainerClass}`}>
                <HeaderIcon size={40} className="text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">{config.title}</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{config.description}</p>

            {categoryBlockedMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-yellow-50 border border-yellow-300 rounded-xl inline-block"
              >
                <p className="text-yellow-800 font-medium">⚠️ {categoryBlockedMessage}</p>
              </motion.div>
            )}

            {user && userGrade && !isAdmin && !categoryBlockedMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-3 rounded-xl inline-block ${config.restrictionNoticeClass}`}
              >
                <p className={`font-medium text-sm ${config.restrictionTextClass}`}>
                  {config.restrictionEmoji} You are signed in as a <span className="font-bold">{userGrade}</span> student. Only Grade {userNumericGrade} content is available.
                </p>
              </motion.div>
            )}
          </motion.div>

          <div className={gridClassName}>
            {cards.map((card, index) => {
              const locked = isGradeLocked(card.grade);
              const summaryPanelClass = locked ? 'bg-gray-100' : config.summaryPanelClass;
              const summaryTextClass = locked ? 'text-gray-400' : config.summaryTextClass;
              const bulletDotClass = locked ? 'bg-gray-300' : config.bulletDotClass;
              const lockReason = config.getLockReason?.(userNumericGrade, card.grade, isAdmin) ?? null;
              const CardIcon = card.icon;
              const cardStats = card.stats ?? [];

              return (
                <motion.div
                  key={`${config.id}-${card.grade}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`group transform transition-all duration-300 ${locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
                  onClick={() => handleGradeSelect(card.grade)}
                  title={lockReason ?? undefined}
                >
                  <div className={`bg-white rounded-3xl shadow-lg p-8 h-full border-2 transition-all duration-300 relative overflow-hidden ${locked ? 'border-gray-200' : `border-transparent ${config.cardHoverBorderClass}`}`}>
                    {locked && (
                      <div className="absolute top-4 right-4 bg-gray-500 text-white p-2 rounded-full z-20">
                        <Lock size={16} />
                      </div>
                    )}

                    <div className={`absolute inset-0 ${locked ? 'bg-gray-300' : `bg-gradient-to-br ${card.gradientClass}`} opacity-5 ${locked ? '' : 'group-hover:opacity-10'} transition-opacity duration-300`}></div>

                    <div className="relative z-10">
                      <div className="flex justify-between items-start gap-4 mb-6">
                        <div className="flex items-start gap-4">
                          {CardIcon && card.iconContainerClass && (
                            <div className={`text-white p-4 rounded-full shadow-lg ${locked ? 'bg-gray-400' : card.iconContainerClass}`}>
                              <CardIcon className="w-8 h-8" />
                            </div>
                          )}
                          <div>
                            <div className={`text-4xl font-bold ${locked ? 'text-gray-400' : `bg-gradient-to-r ${card.gradientClass} bg-clip-text text-transparent`}`}>
                              {card.title}
                            </div>
                          </div>
                        </div>
                        {card.difficulty && card.badgeClass && (
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${locked ? 'bg-gray-400' : card.badgeClass}`}>
                            {card.difficulty}
                          </span>
                        )}
                      </div>

                      <p className={`text-lg mb-4 font-medium ${locked ? 'text-gray-400' : 'text-gray-600'}`}>
                        {card.description}
                      </p>

                      {card.summary && (
                        <div className={`rounded-lg p-3 mb-6 ${summaryPanelClass}`}>
                          <p className={`text-sm font-semibold text-center ${summaryTextClass}`}>{card.summary}</p>
                        </div>
                      )}

                      {card.bulletsTitle && card.bullets && card.bullets.length > 0 && (
                        <div className="space-y-3 mb-6">
                          <h3 className={`font-semibold text-sm uppercase tracking-wide ${locked ? 'text-gray-400' : 'text-gray-700'}`}>
                            {card.bulletsTitle}
                          </h3>
                          <div className="space-y-2">
                            {card.bullets.map((bullet) => (
                              <div key={bullet} className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${bulletDotClass}`}></div>
                                <span className={`text-sm ${locked ? 'text-gray-400' : 'text-gray-600'}`}>{bullet}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {card.chips && card.chips.length > 0 && (
                        <div className="flex flex-wrap gap-2 justify-center mb-6">
                          {card.chips.map((chip) => (
                            <span
                              key={`${card.grade}-${chip}`}
                              className={`text-xs px-2 py-1 rounded-full ${locked ? 'bg-gray-100 text-gray-500' : 'bg-purple-100 text-purple-700'}`}
                            >
                              {chip}
                            </span>
                          ))}
                          {card.overflowChipLabel && (
                            <span className={`text-xs ${locked ? 'text-gray-400' : 'text-purple-600'}`}>
                              {card.overflowChipLabel}
                            </span>
                          )}
                        </div>
                      )}

                      {cardStats.length > 0 && (
                        <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-100">
                          {cardStats.map((stat) => (
                            <div key={`${card.grade}-${stat.label}`} className="text-center flex-1">
                              <div className={`text-2xl font-bold ${locked ? 'text-gray-400' : 'text-gray-700'}`}>{stat.value}</div>
                              <div className="text-xs text-gray-500 uppercase tracking-wide">{stat.label}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {!locked && card.hoverLabel && (
                      <motion.div
                        className="text-center mt-4 text-purple-500 opacity-0 group-hover:opacity-100"
                        transition={{ duration: 0.2 }}
                      >
                        <div className="text-lg">{card.hoverLabel}</div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {config.featurePanel && (
            <motion.div
              className="bg-white rounded-2xl p-6 shadow-lg mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">{config.featurePanel.title}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {config.featurePanel.items.map((item) => (
                  <div key={`${config.id}-${item.title}`} className="text-center p-4">
                    <div className="text-3xl mb-2">{item.icon}</div>
                    <h4 className="font-medium text-gray-800">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {config.instructionsTitle && config.instructions && config.instructions.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 max-w-3xl mx-auto">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{config.instructionsTitle}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
                  {config.instructions.map((instruction, index) => (
                    <div key={`${config.id}-${instruction.title}`} className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mb-3 ${instruction.badgeClass}`}>
                        {index + 1}
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-2">{instruction.title}</h4>
                      <p className="text-center">{instruction.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {showBottomBackButton && (
            <motion.div
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <button
                onClick={() => navigate(config.backRoute)}
                className="inline-flex items-center px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {config.bottomBackButtonLabel ?? 'Back'}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SharedGradeSelectorPage;