import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { assessmentCategories } from '../data/assessmentData';
import FloatingBackground from '../components/FloatingBackground';
import AssessmentProgressBar from '../components/AssessmentProgressBar';
import MindSectionReport from '../components/MindSectionReport';
import '../utils/testProgressUtils'; // For testing - adds window.addTestResults() and window.clearTestResults()
import { ROUTES, categoryRoute, quizRoute, readingAssessmentRoute, blendingSegmentingSelectionRoute } from '../routes';

const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [showReport, setShowReport] = useState(false);

  const category = assessmentCategories.find(cat => cat.id === categoryId);

  if (!category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-300 via-emerald-400 to-lime-500 flex items-center justify-center">
        <FloatingBackground />
        <div className="text-center bg-stone-100 p-8 rounded-2xl shadow-xl border border-stone-200 relative z-10">
          <h1 className="text-2xl font-bold text-stone-800 mb-4">Category Not Found</h1>
          <button
            onClick={() => navigate(ROUTES.CATEGORIES)}
            className="group relative px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-stone-100 rounded-full font-medium overflow-hidden transition-all duration-300 ease-out hover:shadow-lg hover:shadow-emerald-500/25 transform hover:scale-105 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative">Back</span>
          </button>
        </div>
      </div>
    );
  }

  const handleSubcategoryClick = (subcategoryId: string) => {
    if (subcategoryId === 'assessment-generator') {
      navigate(ROUTES.ASSESSMENT_GENERATOR);
    } else if (subcategoryId === 'reading') {
      navigate(readingAssessmentRoute(categoryId!));
    } else if (subcategoryId === 'phonics-awareness') {
      navigate(ROUTES.STARTING_ENDING_SOUND);
    } else if (subcategoryId === 'blending') {
      navigate(blendingSegmentingSelectionRoute(categoryId!));
    } else if (subcategoryId === 'sentence-formation') {
      navigate(ROUTES.VOCABULARY_MATCHING);
    } else if (subcategoryId === 'learning-style') {
      navigate(ROUTES.LEARNING_STYLES_QUIZ);
    } else if (subcategoryId === 'perception') {
      navigate(ROUTES.PERCEPTION_SELECTION);
    } else if (subcategoryId === 'spelling') {
      navigate(ROUTES.SPELLING_GRADES);
    } else if (subcategoryId === 'writing') {
      navigate(ROUTES.WRITING_GRADES);
    } else if (subcategoryId === 'attention') {
      navigate(ROUTES.ATTENTION_MEMORY);
    } else if (subcategoryId === 'oral-language') {
      navigate(ROUTES.ORAL_LANGUAGE_SELECTION);
    } else if (subcategoryId === 'critical-thinking') {
      navigate(ROUTES.CRITICAL_THINKING_SELECTION);
    } else {
      navigate(quizRoute(categoryId!, subcategoryId));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-300 via-emerald-400 to-lime-500 py-8">
      <FloatingBackground />
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(ROUTES.CATEGORIES)}
            className="group flex items-center space-x-2 px-4 py-2 text-stone-600 rounded-lg transition-all duration-300 ease-out hover:text-emerald-700 hover:bg-white/50 hover:shadow-md transform hover:scale-105 hover:-translate-y-0.5"
          >
            <ArrowLeft size={20} className="transform group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">Back</span>
          </button>
        </div>

        {/* Category Info */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent mb-4">{category.title}</h1>
          <p className="text-stone-700 text-lg max-w-2xl mx-auto">{category.description}</p>
        </div>

        {/* Unified Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <AssessmentProgressBar
            onShowReport={() => setShowReport(true)}
            className="mb-6"
          />
        </div>

        {/* Subcategories */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-stone-800 mb-8">Choose an Assessment</h2>
          <div className="space-y-4">
            {category.subcategories.map((subcategory) => (
              <button
                key={subcategory.id}
                onClick={() => handleSubcategoryClick(subcategory.id)}
                className="group w-full flex items-center justify-between p-4 bg-stone-50 rounded-xl shadow-sm border border-stone-200 overflow-hidden transition-all duration-300 ease-out hover:bg-amber-50 hover:shadow-lg hover:border-amber-200 transform hover:scale-105 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-50 to-yellow-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center space-x-4">
                  <div className={`w-4 h-4 rounded-full ${getSubcategoryColor(subcategory.color)} transition-all duration-300 group-hover:scale-110`}></div>
                  <span className="text-stone-800 font-semibold">{subcategory.title}</span>
                </div>
                <div className="relative flex items-center space-x-3">
                  {(subcategory.id === 'attention' || subcategory.id === 'perception' || subcategory.id === 'assessment-generator' || subcategory.id === 'reading' || subcategory.id === 'phonics-awareness' || subcategory.id === 'blending' || subcategory.id === 'sentence-formation' || subcategory.id === 'learning-style' || subcategory.id === 'oral-language' || subcategory.id === 'critical-thinking') ? (
                    <span className="text-emerald-600 text-sm font-medium">Available</span>
                  ) : (
                    <span className="text-stone-400 text-sm">Coming Soon</span>
                  )}
                  <svg className="w-4 h-4 text-stone-400 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReport && (
        <MindSectionReport onClose={() => setShowReport(false)} />
      )}
    </div>
  );
};

// Helper function for subcategory colors
const getSubcategoryColor = (color: string) => {
  switch (color) {
    case 'bg-purple-500':
      return 'bg-emerald-500';
    case 'bg-purple-400':
      return 'bg-teal-500';
    case 'bg-green-500':
      return 'bg-amber-500';
    case 'bg-blue-500':
      return 'bg-cyan-500';
    case 'bg-orange-500':
      return 'bg-orange-500';
    case 'bg-yellow-500':
      return 'bg-yellow-600';
    case 'bg-pink-500':
      return 'bg-stone-500';
    default:
      return 'bg-stone-400';
  }
};

export default CategoryPage;