// import { useState, useEffect } from 'react';
// import { getCategories, getQuizTypes, Category, QuizType } from '../supabase-client';

// interface AssessmentCategory {
//   id: string;
//   title: string;
//   description: string;
//   icon: string;
//   color: string;
//   quizTypes: QuizType[];
// }

// export const useAssessmentData = () => {
//   const [categories, setCategories] = useState<AssessmentCategory[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // Frontend icon mapping (keeping UI concerns in frontend)
//   const iconMap: { [key: string]: string } = {
//     'mind': 'brain',
//     'oral-skills': 'microphone',
//     'academic-skills': 'calculator'
//   };

//   const colorMap: { [key: string]: string } = {
//     'mind': 'violet',
//     'oral-skills': 'blue', 
//     'academic-skills': 'emerald'
//   };

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       // Fetch categories
//       const { data: categoriesData, error: categoriesError } = await getCategories();
//       if (categoriesError) throw categoriesError;

//       // Fetch all quiz types
//       const { data: quizTypesData, error: quizTypesError } = await getQuizTypes();
//       if (quizTypesError) throw quizTypesError;

//       // Group quiz types by category and add UI metadata
//       const categoriesWithQuizTypes: AssessmentCategory[] = categoriesData?.map(category => ({
//         id: category.id,
//         title: category.name,
//         description: category.description,
//         icon: iconMap[category.slug] || 'brain',
//         color: colorMap[category.slug] || 'violet',
//         quizTypes: quizTypesData?.filter(qt => qt.category_id === category.id) || []
//       })) || [];

//       setCategories(categoriesWithQuizTypes);
//     } catch (err: any) {
//       setError(err.message || 'Failed to fetch assessment data');
//       console.error('Error fetching assessment data:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   return {
//     categories,
//     loading,
//     error,
//     refetch: fetchData
//   };
// };