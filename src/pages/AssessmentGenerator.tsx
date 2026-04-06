import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Clock, Users, BookOpen } from 'lucide-react';
import { generateAssessmentWithGemini } from '../utils/assessmentApi';
import { ROUTES } from '../routes';

interface AssessmentForm {
  grade: number;
  curriculum: string;
  subject: string;
  difficulty: 'easy' | 'intermediate' | 'hard';
  duration: number;
  topics: string;
  includeAnswerKey: boolean;
}

const AssessmentGenerator: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AssessmentForm>({
    grade: 4,
    curriculum: 'Ontario',
    subject: 'Math',
    difficulty: 'intermediate',
    duration: 45,
    topics: 'Number Sense, Data Management',
    includeAnswerKey: true
  });
  const [generatedAssessment, setGeneratedAssessment] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');

  const handleInputChange = (field: keyof AssessmentForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateAssessment = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
      const topicsList = formData.topics.split(',').map(t => t.trim()).filter(t => t);
      
      // Use Gemini API for real assessment generation
      const result = await generateAssessmentWithGemini({
        grade: formData.grade,
        curriculum: formData.curriculum,
        subject: formData.subject,
        difficulty: formData.difficulty,
        duration: formData.duration,
        topics: topicsList,
        includeAnswerKey: formData.includeAnswerKey
      });

      if (result.success) {
        setGeneratedAssessment(result.assessment);
      } else {
        setError(result.error || 'Failed to generate assessment');
      }
    } catch (err) {
      setError('Error generating assessment. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadAssessment = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedAssessment], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Grade${formData.grade}_${formData.subject}_assessment.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-emerald-500 relative overflow-hidden">
      {/* Navigation */}
      <div className="relative z-10 p-6">
        <button
          onClick={() => navigate(ROUTES.CATEGORY_ACADEMIC_SKILLS)}
          className="flex items-center space-x-2 text-white hover:text-gray-200 bg-white/20 px-4 py-2 rounded-lg transition-colors duration-200"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-6 pb-24 md:pb-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-4">
              Assessment Generator
            </h1>
            <p className="text-white/90 text-lg drop-shadow-md">
              Create customized assessments tailored to your curriculum and requirements
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {/* Single Column Form Layout */}
            <div className="bg-white rounded-2xl p-8 shadow-card max-w-4xl mx-auto w-full">
              <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center flex items-center justify-center">
                <FileText className="mr-3 text-emerald-600" size={32} />
                Assessment Generator
              </h2>

              <div className="space-y-6">
                {/* Grade and Curriculum Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Grade Level
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={formData.grade}
                      onChange={(e) => handleInputChange('grade', parseInt(e.target.value))}
                      className="w-full px-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Curriculum
                    </label>
                    <input
                      type="text"
                      value={formData.curriculum}
                      onChange={(e) => handleInputChange('curriculum', e.target.value)}
                      className="w-full px-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors shadow-sm"
                    />
                  </div>
                </div>

                {/* Subject and Difficulty Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      className="w-full px-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Difficulty Level
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => handleInputChange('difficulty', e.target.value)}
                      className="w-full px-4 py-4 text-lg text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors shadow-sm bg-white"
                    >
                      <option value="easy" className="text-black">Easy</option>
                      <option value="intermediate" className="text-black">Intermediate</option>
                      <option value="hard" className="text-black">Hard</option>
                    </select>
                  </div>
                </div>

                {/* Duration Slider */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Duration (in minutes): {formData.duration}
                  </label>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <input
                      type="range"
                      min="10"
                      max="90"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                      <span>10 min</span>
                      <span className="font-semibold text-emerald-600">{formData.duration} minutes</span>
                      <span>90 min</span>
                    </div>
                  </div>
                </div>

                {/* Topics */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Topics (comma-separated)
                  </label>
                  <textarea
                    value={formData.topics}
                    onChange={(e) => handleInputChange('topics', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors shadow-sm"
                    placeholder="e.g. Number Sense, Data Management, Geometry"
                  />
                </div>

                {/* Include Answer Key */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="answerKey"
                      checked={formData.includeAnswerKey}
                      onChange={(e) => handleInputChange('includeAnswerKey', e.target.checked)}
                      className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <label htmlFor="answerKey" className="ml-3 block text-lg font-medium text-gray-700">
                      Include Answer Key
                    </label>
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={generateAssessment}
                  disabled={isGenerating}
                  className="w-full bg-emerald-600 text-white py-6 px-8 rounded-xl text-xl font-bold hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Generating Assessment...
                    </>
                  ) : (
                    <>
                      <BookOpen className="mr-3" size={24} />
                      Generate Assessment
                    </>
                  )}
                </button>

                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-center">
                    <strong>Error:</strong> {error}
                  </div>
                )}

                {/* Results Section */}
                {generatedAssessment && (
                  <div className="border-t border-gray-200 pt-8 mt-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                      <FileText className="mr-3 text-emerald-600" size={24} />
                      📝 Generated Assessment
                    </h3>
                    
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 max-h-96 overflow-y-auto mb-6">
                      <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                        {generatedAssessment}
                      </pre>
                    </div>
                    
                    <button
                      onClick={downloadAssessment}
                      className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl text-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 flex items-center justify-center shadow-lg"
                    >
                      <Download className="mr-3" size={20} />
                      💾 Download as .txt
                    </button>
                  </div>
                )}

                {/* Placeholder when no assessment */}
                {!generatedAssessment && !isGenerating && !error && (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                    <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">
                      Configure your assessment parameters above and click "Generate Assessment" to create a customized test.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/90 rounded-xl p-6 shadow-lg text-center">
              <Clock className="mx-auto h-12 w-12 text-emerald-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Flexible Duration</h3>
              <p className="text-gray-600 text-sm">Set assessment duration from 10 to 90 minutes based on your needs</p>
            </div>
            
            <div className="bg-white/90 rounded-xl p-6 shadow-lg text-center">
              <Users className="mx-auto h-12 w-12 text-emerald-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Grade Adaptive</h3>
              <p className="text-gray-600 text-sm">Supports grades 1-12 with curriculum-specific content</p>
            </div>
            
            <div className="bg-white/90 rounded-xl p-6 shadow-lg text-center">
              <BookOpen className="mx-auto h-12 w-12 text-emerald-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Topic Focused</h3>
              <p className="text-gray-600 text-sm">Generate assessments for specific topics or comprehensive coverage</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="grid grid-cols-4 h-16">
          {/* Home Button */}
          <button
            onClick={() => navigate(ROUTES.HOME)}
            className="flex flex-col items-center justify-center py-2 px-1 text-gray-500 hover:text-emerald-600 transition-colors duration-200"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium">Home</span>
          </button>

          {/* Categories Button */}
          <button
            onClick={() => navigate(ROUTES.CATEGORIES)}
            className="flex flex-col items-center justify-center py-2 px-1 text-gray-500 hover:text-emerald-600 transition-colors duration-200"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-xs font-medium">Categories</span>
          </button>

          {/* Profile Button */}
          <button
            onClick={() => navigate(ROUTES.AUTH)}
            className="flex flex-col items-center justify-center py-2 px-1 text-gray-500 hover:text-emerald-600 transition-colors duration-200"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs font-medium">Profile</span>
          </button>

          {/* Help Button */}
          <button
            onClick={() => navigate('/contact')}
            className="flex flex-col items-center justify-center py-2 px-1 text-gray-500 hover:text-emerald-600 transition-colors duration-200"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium">Help</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentGenerator;