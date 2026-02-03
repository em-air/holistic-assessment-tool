/**
 * Spot the Difference Game Data (Frontend Version)
 * Visual perception assessment for identifying differences between images.
 */

export interface Difference {
  x: number;
  y: number;
  radius: number;
}

export interface SceneConfig {
  sceneType: 'playground' | 'bedroom' | 'kitchen' | 'classroom' | 'toys' | 'garden';
  differencesA: string[];
  differencesB: string[];
}

export interface GameLevel {
  id: number;
  grade: number;
  imageA: string;
  imageB: string;
  differences: Difference[];
  sceneConfig: SceneConfig;
  useCartoonScene: boolean;
}

export interface GameLevelWithScene extends GameLevel {
  sceneConfig: SceneConfig;
  useCartoonScene: boolean;
}

export const spotTheDifferenceData: GameLevelWithScene[] = [
  {
    id: 1,
    grade: 1,
    imageA: "",
    imageB: "",
    useCartoonScene: true,
    sceneConfig: {
      sceneType: 'toys',
      differencesA: [],
      differencesB: ['missing-block', 'ball-color', 'extra-bear'],
    },
    differences: [
      { x: 120, y: 220, radius: 25 },
      { x: 300, y: 220, radius: 25 },
      { x: 150, y: 320, radius: 20 },
    ]
  },
  {
    id: 2,
    grade: 1,
    imageA: "",
    imageB: "",
    useCartoonScene: true,
    sceneConfig: {
      sceneType: 'playground',
      differencesA: [],
      differencesB: ['missing-swing', 'slide-color', 'extra-cloud', 'missing-toy'],
    },
    differences: [
      { x: 89, y: 190, radius: 30 },
      { x: 250, y: 240, radius: 35 },
      { x: 200, y: 40, radius: 25 },
      { x: 280, y: 290, radius: 20 },
    ]
  },
  {
    id: 3,
    grade: 2,
    imageA: "",
    imageB: "",
    useCartoonScene: true,
    sceneConfig: {
      sceneType: 'bedroom',
      differencesA: [],
      differencesB: ['missing-pillow', 'book-color', 'extra-toy', 'rug-pattern', 'missing-sticker'],
    },
    differences: [
      { x: 100, y: 170, radius: 20 },
      { x: 460, y: 112, radius: 15 },
      { x: 280, y: 250, radius: 15 },
      { x: 200, y: 350, radius: 40 },
      { x: 385, y: 170, radius: 15 },
    ]
  },
  {
    id: 4,
    grade: 2,
    imageA: "",
    imageB: "",
    useCartoonScene: true,
    sceneConfig: {
      sceneType: 'garden',
      differencesA: [],
      differencesB: ['flower1-color', 'extra-flower', 'extra-butterfly', 'missing-watering-can'],
    },
    differences: [
      { x: 150, y: 280, radius: 20 },
      { x: 250, y: 285, radius: 20 },
      { x: 185, y: 150, radius: 18 },
      { x: 350, y: 300, radius: 25 },
    ]
  },
  {
    id: 5,
    grade: 3,
    imageA: "",
    imageB: "",
    useCartoonScene: true,
    sceneConfig: {
      sceneType: 'classroom',
      differencesA: [],
      differencesB: ['missing-pencil', 'book-spine', 'extra-eraser', 'missing-poster', 'chair-color', 'extra-apple', 'missing-clock-hand'],
    },
    differences: [
      { x: 381, y: 192, radius: 12 },
      { x: 324, y: 186, radius: 10 },
      { x: 399, y: 190, radius: 10 },
      { x: 440, y: 110, radius: 35 },
      { x: 370, y: 155, radius: 20 },
      { x: 360, y: 175, radius: 12 },
      { x: 445, y: 190, radius: 8 },
    ]
  },
  {
    id: 6,
    grade: 3,
    imageA: "",
    imageB: "",
    useCartoonScene: true,
    sceneConfig: {
      sceneType: 'kitchen',
      differencesA: [],
      differencesB: ['missing-ingredient', 'bowl-color', 'extra-spoon', 'missing-fruit', 'board-color', 'extra-tool', 'missing-napkin', 'plate-pattern'],
    },
    differences: [
      { x: 90, y: 235, radius: 15 },
      { x: 200, y: 240, radius: 25 },
      { x: 400, y: 235, radius: 12 },
      { x: 150, y: 235, radius: 15 },
      { x: 330, y: 250, radius: 25 },
      { x: 453, y: 237, radius: 10 },
      { x: 132, y: 270, radius: 15 },
      { x: 180, y: 280, radius: 20 },
    ]
  }
];

/**
 * Get levels for a specific grade
 */
export const getLevelsByGrade = (grade: number): GameLevelWithScene[] => {
  return spotTheDifferenceData.filter(level => level.grade === grade);
};

/**
 * Check if a click is within a difference radius
 */
export const checkDifference = (
  levelId: number,
  clickX: number,
  clickY: number
): { found: boolean; differenceIndex: number } => {
  const level = spotTheDifferenceData.find(l => l.id === levelId);
  if (!level) return { found: false, differenceIndex: -1 };
  
  for (let i = 0; i < level.differences.length; i++) {
    const diff = level.differences[i];
    const distance = Math.sqrt(Math.pow(clickX - diff.x, 2) + Math.pow(clickY - diff.y, 2));
    if (distance <= diff.radius) {
      return { found: true, differenceIndex: i };
    }
  }
  
  return { found: false, differenceIndex: -1 };
};

/**
 * Get total difference count for a level
 */
export const getDifferenceCount = (levelId: number): number => {
  const level = spotTheDifferenceData.find(l => l.id === levelId);
  return level?.differences.length || 0;
};

export default spotTheDifferenceData;
