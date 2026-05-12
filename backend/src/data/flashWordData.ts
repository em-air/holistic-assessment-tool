export interface FlashWordItem {
  id: number;
  image: string;
  word: string;
}

export type FlashWordGrade = 'grade1' | 'grade2' | 'grade3' | 'grade4';

export interface FlashWordGradeSummary {
  grade: FlashWordGrade;
  questionCount: number;
  showImage: boolean;
}

const flashWordData: Record<FlashWordGrade, FlashWordItem[]> = {
  grade1: [
    { id: 1, image: 'https://images.unsplash.com/vector-1741847236185-27b1ff478511?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2F0fGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=600', word: 'cat' },
    { id: 2, image: 'https://images.unsplash.com/vector-1740286698618-7f01b97f6899?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=880', word: 'dog' },
    { id: 3, image: 'https://images.unsplash.com/vector-1738925311171-6897d223702e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=880', word: 'sun' },
    { id: 4, image: 'https://plus.unsplash.com/premium_vector-1718166509477-327bc1cba9f9?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGJhbGx8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600', word: 'ball' },
    { id: 5, image: 'https://plus.unsplash.com/premium_vector-1731660866896-69378f2b9a6a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=880', word: 'tree' },
    { id: 6, image: 'https://plus.unsplash.com/premium_vector-1727952231396-e301fbf4ef1b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Ym9va3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600', word: 'book' },
    { id: 7, image: 'https://images.unsplash.com/vector-1743702228669-15c868db27e6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2FyfGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=600', word: 'car' },
    { id: 8, image: 'https://plus.unsplash.com/premium_vector-1711987775501-7f3b47be125d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aGF0fGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=600', word: 'hat' },
  ],
  grade2: [
    { id: 1, image: 'https://plus.unsplash.com/premium_vector-1727952230707-372d1ba06834?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8d2F0ZXJ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600', word: 'water' },
    { id: 2, image: 'https://plus.unsplash.com/premium_vector-1682304496080-70b295c04782?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGpveXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600', word: 'happy' },
    { id: 3, image: 'https://plus.unsplash.com/premium_vector-1721890983105-625c0d32045f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aG91c2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600', word: 'house' },
    { id: 4, image: 'https://plus.unsplash.com/premium_vector-1721918267898-1723de525ab3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGZsb3dlcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600', word: 'flower' },
    { id: 5, image: 'https://source.unsplash.com/200x200/?yellow', word: 'yellow' },
    { id: 6, image: 'https://plus.unsplash.com/premium_vector-1733389194552-e60c558f76be?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=764', word: 'friend' },
    { id: 7, image: 'https://images.unsplash.com/vector-1740296579124-fea8e9995120?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8ZmFtaWx5fGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=600', word: 'family' },
    { id: 8, image: 'https://images.unsplash.com/vector-1740296579124-fea8e9995120?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8ZmFtaWx5fGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=600', word: 'apple' },
  ],
  grade3: [
    { id: 1, image: 'https://source.unsplash.com/200x200/?between', word: 'between' },
    { id: 2, image: 'https://source.unsplash.com/200x200/?animal', word: 'animal' },
    { id: 3, image: 'https://source.unsplash.com/200x200/?follow', word: 'follow' },
    { id: 4, image: 'https://source.unsplash.com/200x200/?mother', word: 'mother' },
    { id: 5, image: 'https://source.unsplash.com/200x200/?school', word: 'school' },
    { id: 6, image: 'https://source.unsplash.com/200x200/?picture', word: 'picture' },
    { id: 7, image: 'https://source.unsplash.com/200x200/?kitchen', word: 'kitchen' },
    { id: 8, image: 'https://source.unsplash.com/200x200/?garden', word: 'garden' },
  ],
  grade4: [
    { id: 1, image: 'https://source.unsplash.com/200x200/?because', word: 'because' },
    { id: 2, image: 'https://source.unsplash.com/200x200/?beautiful', word: 'beautiful' },
    { id: 3, image: 'https://source.unsplash.com/200x200/?another', word: 'another' },
    { id: 4, image: 'https://source.unsplash.com/200x200/?different', word: 'different' },
    { id: 5, image: 'https://source.unsplash.com/200x200/?thought', word: 'thought' },
    { id: 6, image: 'https://source.unsplash.com/200x200/?important', word: 'important' },
    { id: 7, image: 'https://source.unsplash.com/200x200/?remember', word: 'remember' },
    { id: 8, image: 'https://source.unsplash.com/200x200/?surprise', word: 'surprise' },
  ],
};

const gradeOrder: FlashWordGrade[] = ['grade1', 'grade2', 'grade3', 'grade4'];

export const getFlashWordGradeSummaries = (): FlashWordGradeSummary[] =>
  gradeOrder.map((grade) => ({
    grade,
    questionCount: flashWordData[grade].length,
    showImage: grade === 'grade1' || grade === 'grade2',
  }));

export const getFlashWordsByGrade = (grade: FlashWordGrade): FlashWordItem[] =>
  (flashWordData[grade] ?? []).map((item) => ({ ...item }));