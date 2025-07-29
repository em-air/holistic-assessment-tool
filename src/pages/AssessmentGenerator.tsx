import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { assessmentCategories } from '../data/assessmentData';

const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();

  const category = assessmentCategories.find(cat => cat.id === categoryId);

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Category Not Found</h1>
          <button
            onClick={() => navigate('/')}
            className="bg-indigo-500 text-white px-6 py-3 rounded-full hover:bg-indigo-600"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const handleSubcategoryClick = (subcategoryId: string) => {
    if (subcategoryId === 'assessment-generator') {
      navigate('/assessment-generator');
    } else {
      navigate(`/quiz/${categoryId}/${subcategoryId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Category Info */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{category.title}</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">{category.description}</p>
        </div>

        {/* Subcategories */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-8">Choose an Assessment</h2>
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
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;