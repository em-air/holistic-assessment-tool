import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { assessmentCategories } from '../data/assessmentData';

const CategoryPage: React.FC = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const category = assessmentCategories.find(cat => cat.id === categoryId);

  if (!category) {
    return <div>Category not found</div>;
  }

 const handleSubcategoryClick = (subcategoryId: string) => {
  if (subcategoryId === 'assessment-generator') {
    navigate('/assessment-generator');
  } else if (subcategoryId === 'attention') {
    navigate(`/quiz/${categoryId}/${subcategoryId}`);
  } else {
    alert('This assessment is coming soon!');
  }
};

  const getCardBgColor = (color: string) => {
    switch (color) {
      case 'mind':
        return 'bg-gradient-to-br from-mind-100 to-mind-200';
      case 'oral':
        return 'bg-gradient-to-br from-oral-100 to-oral-200';
      case 'academic':
        return 'bg-gradient-to-br from-academic-100 to-academic-200';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-8"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{category.title} Assessment</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {category.description}
          </p>
        </div>

        <div className={`rounded-3xl p-8 shadow-lg ${getCardBgColor(category.color)} max-w-2xl mx-auto`}>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Select Assessment Area
          </h2>
          
    <div className="space-y-4">
            {category.subcategories.map((subcategory) => (
              <button
                key={subcategory.id}
                onClick={() => handleSubcategoryClick(subcategory.id)}
                className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-4 h-4 rounded-full ${subcategory.color}`}></div>
                  <span className="text-gray-800 font-semibold">{subcategory.title}</span>
                </div>
                {(subcategory.id === 'attention' || subcategory.id === 'assessment-generator') ? (
                  <span className="text-green-600 text-sm font-medium">Available</span>
                ) : (
                  <span className="text-gray-400 text-sm">Coming Soon</span>
                )}
              </button>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => handleSubcategoryClick('attention')}
              className="bg-accent-500 hover:bg-accent-600 text-white font-semibold py-3 px-8 rounded-full transition-colors duration-200"
            >
              Start Assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;