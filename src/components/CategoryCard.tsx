import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AssessmentCategory } from '../types';

interface CategoryCardProps {
  category: AssessmentCategory;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const navigate = useNavigate();

  const getCardBgColor = (color: string) => {
    switch (color) {
      case 'mind':
        return 'bg-gradient-to-br from-mind-200 to-mind-300';
      case 'oral':
        return 'bg-gradient-to-br from-oral-200 to-oral-300';
      case 'academic':
        return 'bg-gradient-to-br from-academic-200 to-academic-300';
      default:
        return 'bg-gray-200';
    }
  };

  const handleStartAssessment = () => {
    navigate(`/category/${category.id}`);
  };

  return (
    <div className={`rounded-3xl p-8 shadow-lg ${getCardBgColor(category.color)} max-w-sm mx-auto`}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">{category.title}</h2>
        <p className="text-gray-700 text-sm leading-relaxed">
          {category.description}
        </p>
      </div>

      <div className="space-y-3 mb-8">
        {category.subcategories.map((subcategory) => (
          <div key={subcategory.id} className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${subcategory.color}`}></div>
            <span className="text-gray-700 text-sm">{subcategory.title}</span>
          </div>
        ))}
      </div>

      <button
        onClick={handleStartAssessment}
        className="w-full bg-accent-500 hover:bg-accent-600 text-white font-semibold py-3 px-6 rounded-full transition-colors duration-200"
      >
        {category.id === 'mind' ? 'Take Assessment' : 
         category.id === 'oral-skills' ? 'Explore' : 
         'Start Academic Skills Test'}
      </button>
    </div>
  );
};

export default CategoryCard;