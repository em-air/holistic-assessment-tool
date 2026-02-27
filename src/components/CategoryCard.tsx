import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { AssessmentCategory } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { getNumericGrade, canAccessCategory, getCategoryBlockedMessage } from '../utils/gradeUtils';
import { ROUTES, categoryRoute, readingAssessmentRoute, blendingSegmentingSelectionRoute, quizRoute } from '../routes';

interface CategoryCardProps {
  category: AssessmentCategory;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const navigate = useNavigate();
  const { grade: userGrade, isAdmin, user } = useAuth();
  const numericGrade = getNumericGrade(userGrade);
  const isAdminUser = isAdmin || false;

  // Check if this category is blocked for the user (convert to boolean with !!)
  const isBlocked = !!(user && !canAccessCategory(numericGrade, category.id, isAdminUser));
  const blockedMessage = getCategoryBlockedMessage(numericGrade, category.id);

  const getCardBgColor = (color: string, blocked: boolean = false) => {
    if (blocked) {
      return 'bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 opacity-60';
    }
    switch (color) {
      case 'mind':
        return 'bg-gradient-to-br from-purple-100 to-indigo-100 hover:from-purple-200 hover:to-indigo-200 border border-purple-200 hover:border-purple-300';
      case 'oral':
        return 'bg-gradient-to-br from-emerald-100 to-teal-100 hover:from-emerald-200 hover:to-teal-200 border border-emerald-200 hover:border-emerald-300';
      case 'academic':
        return 'bg-gradient-to-br from-orange-100 to-yellow-100 hover:from-orange-200 hover:to-yellow-200 border border-orange-200 hover:border-orange-300';
      default:
        return 'bg-gradient-to-br from-blue-100 to-cyan-100 hover:from-blue-200 hover:to-cyan-200 border border-blue-200 hover:border-blue-300';
    }
  };

  const getCardEmoji = (color: string) => {
    switch (color) {
      case 'mind':
        return '🧠';
      case 'oral':
        return '🗣️';
      case 'academic':
        return '📚';
      default:
        return '⭐';
    }
  };

  const getTextColor = (color: string, blocked: boolean = false) => {
    if (blocked) return 'text-gray-500';
    switch (color) {
      case 'mind':
        return 'text-purple-800';
      case 'oral':
        return 'text-emerald-800';
      case 'academic':
        return 'text-orange-800';
      default:
        return 'text-blue-800';
    }
  };

  const getSubtextColor = (color: string, blocked: boolean = false) => {
    if (blocked) return 'text-gray-400';
    switch (color) {
      case 'mind':
        return 'text-purple-600';
      case 'oral':
        return 'text-emerald-600';
      case 'academic':
        return 'text-orange-600';
      default:
        return 'text-blue-600';
    }
  };

  const handleStartAssessment = () => {
    if (isBlocked) return; // Don't navigate if blocked
    navigate(categoryRoute(category.id));
  };

  const handleSubcategoryClick = (subcategoryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isBlocked) return;

    // Route mapping matching CategoryPage logic
    switch (subcategoryId) {
      case 'attention':
        navigate(ROUTES.ATTENTION_MEMORY);
        break;
      case 'learning-style':
        navigate(ROUTES.LEARNING_STYLES_QUIZ);
        break;
      case 'critical-thinking':
        navigate(ROUTES.CRITICAL_THINKING_SELECTION);
        break;
      case 'perception':
        navigate(ROUTES.PERCEPTION_SELECTION);
        break;
      case 'oral-language':
        navigate(ROUTES.ORAL_LANGUAGE_SELECTION);
        break;
      case 'reading':
        navigate(readingAssessmentRoute(category.id));
        break;
      case 'phonics-awareness':
        navigate(ROUTES.STARTING_ENDING_SOUND);
        break;
      case 'blending':
        navigate(blendingSegmentingSelectionRoute(category.id));
        break;
      case 'writing':
        navigate(ROUTES.WRITING_GRADES);
        break;
      case 'sentence-formation':
        navigate(ROUTES.VOCABULARY_MATCHING);
        break;
      case 'spelling':
        navigate(ROUTES.SPELLING_GRADES);
        break;
      case 'assessment-generator':
        navigate(ROUTES.ASSESSMENT_GENERATOR);
        break;
      default:
        navigate(quizRoute(category.id, subcategoryId));
    }
  };

  return (
    <div
      className={`group rounded-2xl p-6 shadow-sm ${isBlocked ? '' : 'hover:shadow-lg'} ${getCardBgColor(category.color, isBlocked)} max-w-sm mx-auto transform transition-all duration-500 ease-out ${isBlocked ? 'cursor-not-allowed' : 'hover:scale-105 cursor-pointer'} overflow-hidden relative`}
      title={blockedMessage || undefined}
    >
      {/* Lock overlay for blocked categories */}
      {isBlocked && (
        <div className="absolute top-3 right-3 bg-gray-600 text-white p-2 rounded-full z-10">
          <Lock size={16} />
        </div>
      )}

      {/* Animated background overlay */}
      {!isBlocked && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      )}

      <div className="relative">
        <div className="text-center mb-6">
          <div className={`text-4xl mb-4 transform transition-all duration-300 ${isBlocked ? 'grayscale opacity-50' : 'group-hover:scale-110 group-hover:rotate-6'}`}>
            {getCardEmoji(category.color)}
          </div>
          <h2 className={`text-xl font-semibold ${getTextColor(category.color, isBlocked)} mb-3 transition-colors duration-300`}>
            {category.title}
          </h2>
          <p className={`${getSubtextColor(category.color, isBlocked)} text-sm leading-relaxed font-normal transition-colors duration-300`}>
            {category.description}
          </p>
        </div>

        {/* Blocked message */}
        {isBlocked && blockedMessage && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-xs text-center flex items-center justify-center gap-1">
              <Lock size={12} />
              {blockedMessage}
            </p>
          </div>
        )}

        <div className="space-y-3 mb-6">
          {category.subcategories.map((subcategory, index) => (
            <div
              key={subcategory.id}
              onClick={(e) => handleSubcategoryClick(subcategory.id, e)}
              className={`flex items-center space-x-3 ${isBlocked ? 'bg-gray-100/60' : 'bg-white/60 hover:bg-white/90 hover:shadow-md cursor-pointer'} rounded-lg px-3 py-2 transition-all duration-300 ${!isBlocked && 'transform hover:translate-x-1'}`}
              style={{
                transitionDelay: `${index * 50}ms`
              }}
            >
              <div className={`w-3 h-3 rounded-full ${isBlocked ? 'bg-gray-300' : getSubcategoryColor(subcategory.color)} transition-all duration-300 ${!isBlocked && 'group-hover:scale-110'}`}></div>
              <span className={`${getTextColor(category.color, isBlocked)} text-sm font-medium transition-colors duration-300 ${!isBlocked && 'hover:underline'}`}>
                {subcategory.title}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={handleStartAssessment}
          disabled={isBlocked}
          className={`group/btn relative w-full ${isBlocked ? 'bg-gray-400 cursor-not-allowed' : getButtonColor(category.color)} text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 shadow-sm ${!isBlocked && 'hover:shadow-lg'} text-sm overflow-hidden transform ${!isBlocked && 'hover:scale-105 hover:-translate-y-1'}`}
        >
          {!isBlocked && (
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
          )}
          <div className="relative flex items-center justify-center space-x-2">
            {isBlocked ? (
              <>
                <Lock size={16} />
                <span>Not Available</span>
              </>
            ) : (
              <>
                <span>
                  {category.id === 'mind' ? 'Start Cognition Assessment' :
                    category.id === 'oral-skills' ? 'Start Oral Skills' :
                      'Begin Assessment'}
                </span>
                <svg className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </div>
        </button>
      </div>
    </div>
  );
};

// Helper function for subcategory colors
const getSubcategoryColor = (color: string) => {
  switch (color) {
    case 'bg-purple-500':
      return 'bg-purple-400';
    case 'bg-purple-400':
      return 'bg-indigo-400';
    case 'bg-green-500':
      return 'bg-emerald-400';
    case 'bg-blue-500':
      return 'bg-blue-400';
    case 'bg-orange-500':
      return 'bg-orange-400';
    case 'bg-yellow-500':
      return 'bg-yellow-400';
    case 'bg-pink-500':
      return 'bg-pink-400';
    default:
      return 'bg-slate-400';
  }
};

// Helper function for button colors
const getButtonColor = (color: string) => {
  switch (color) {
    case 'mind':
      return 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700';
    case 'oral':
      return 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700';
    case 'academic':
      return 'bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700';
    default:
      return 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700';
  }
};

export default CategoryCard;