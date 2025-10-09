import React from 'react';

interface OralLanguageImageProps {
  type: string;
  className?: string;
}

const OralLanguageImage: React.FC<OralLanguageImageProps> = ({ type, className = '' }) => {
  const renderImage = () => {
    switch (type) {
      case 'Apple':
        return (
          <svg viewBox="0 0 300 200" className={`w-full h-full ${className}`}>
            <rect width="300" height="200" fill="#f0f8ff" />
            <circle cx="150" cy="100" r="50" fill="#ff4444" />
            <ellipse cx="150" cy="90" rx="45" ry="40" fill="#ff6666" />
            <rect x="145" y="50" width="10" height="20" fill="#8B4513" />
            <ellipse cx="155" cy="45" rx="8" ry="4" fill="#228B22" />
            <text x="150" y="170" textAnchor="middle" className="text-lg font-bold fill-gray-700">Apple</text>
          </svg>
        );
      
      case 'Chair':
        return (
          <svg viewBox="0 0 300 200" className={`w-full h-full ${className}`}>
            <rect width="300" height="200" fill="#f5f5dc" />
            <rect x="100" y="60" width="100" height="80" fill="#8B4513" />
            <rect x="95" y="55" width="110" height="10" fill="#8B4513" />
            <rect x="100" y="140" width="8" height="40" fill="#8B4513" />
            <rect x="192" y="140" width="8" height="40" fill="#8B4513" />
            <rect x="100" y="70" width="8" height="40" fill="#8B4513" />
            <rect x="192" y="70" width="8" height="40" fill="#8B4513" />
            <text x="150" y="190" textAnchor="middle" className="text-lg font-bold fill-gray-700">Chair</text>
          </svg>
        );
      
      case 'Car':
        return (
          <svg viewBox="0 0 300 200" className={`w-full h-full ${className}`}>
            <rect width="300" height="200" fill="#e6f3ff" />
            <rect x="80" y="100" width="140" height="40" fill="#4169E1" />
            <rect x="100" y="80" width="100" height="20" fill="#4169E1" />
            <circle cx="110" cy="150" r="15" fill="#333" />
            <circle cx="190" cy="150" r="15" fill="#333" />
            <rect x="90" y="90" width="20" height="15" fill="#87CEEB" />
            <rect x="190" y="90" width="20" height="15" fill="#87CEEB" />
            <text x="150" y="185" textAnchor="middle" className="text-lg font-bold fill-gray-700">Car</text>
          </svg>
        );
      
      case 'Running':
        return (
          <svg viewBox="0 0 300 200" className={`w-full h-full ${className}`}>
            <rect width="300" height="200" fill="#f0fff0" />
            <circle cx="150" cy="60" r="20" fill="#ffdbac" />
            <rect x="140" y="80" width="20" height="40" fill="#4169E1" />
            <rect x="135" y="120" width="12" height="30" fill="#333" />
            <rect x="153" y="120" width="12" height="30" fill="#333" />
            <rect x="125" y="85" width="15" height="8" fill="#ffdbac" />
            <rect x="160" y="85" width="15" height="8" fill="#ffdbac" />
            <text x="150" y="185" textAnchor="middle" className="text-lg font-bold fill-gray-700">Running</text>
          </svg>
        );
      
      case 'Eating':
        return (
          <svg viewBox="0 0 300 200" className={`w-full h-full ${className}`}>
            <rect width="300" height="200" fill="#fff8dc" />
            <circle cx="150" cy="70" r="20" fill="#ffdbac" />
            <rect x="140" y="90" width="20" height="40" fill="#ff69b4" />
            <rect x="170" y="95" width="15" height="4" fill="#8B4513" />
            <circle cx="185" cy="97" r="3" fill="#ff4444" />
            <text x="150" y="185" textAnchor="middle" className="text-lg font-bold fill-gray-700">Eating</text>
          </svg>
        );
      
      case 'Fruits Mix':
        return (
          <svg viewBox="0 0 300 200" className={`w-full h-full ${className}`}>
            <rect width="300" height="200" fill="#f5fffa" />
            <circle cx="100" cy="100" r="25" fill="#ff4444" />
            <circle cx="150" cy="100" r="25" fill="#ffa500" />
            <ellipse cx="200" cy="100" rx="15" ry="25" fill="#ffff00" />
            <text x="150" y="170" textAnchor="middle" className="text-lg font-bold fill-gray-700">Fruits</text>
          </svg>
        );
      
      case 'Boy with Dog':
        return (
          <svg viewBox="0 0 300 200" className={`w-full h-full ${className}`}>
            <rect width="300" height="200" fill="#e6ffe6" />
            <circle cx="120" cy="60" r="15" fill="#ffdbac" />
            <rect x="110" y="75" width="20" height="35" fill="#4169E1" />
            <rect x="105" y="110" width="12" height="25" fill="#333" />
            <rect x="123" y="110" width="12" height="25" fill="#333" />
            <ellipse cx="180" cy="110" rx="20" ry="15" fill="#8B4513" />
            <circle cx="170" cy="105" r="5" fill="#8B4513" />
            <text x="150" y="185" textAnchor="middle" className="text-lg font-bold fill-gray-700">Boy with Dog</text>
          </svg>
        );
      
      case 'Boy Feeding Dog':
        return (
          <svg viewBox="0 0 300 200" className={`w-full h-full ${className}`}>
            <rect width="300" height="200" fill="#e6ffe6" />
            <circle cx="120" cy="60" r="15" fill="#ffdbac" />
            <rect x="110" y="75" width="20" height="35" fill="#4169E1" />
            <rect x="135" y="85" width="12" height="4" fill="#8B4513" />
            <ellipse cx="180" cy="110" rx="20" ry="15" fill="#8B4513" />
            <circle cx="170" cy="105" r="5" fill="#8B4513" />
            <rect x="165" y="120" width="15" height="5" fill="#ff4444" />
            <text x="150" y="185" textAnchor="middle" className="text-lg font-bold fill-gray-700">Feeding Dog</text>
          </svg>
        );
      
      case 'Playground Scene':
        return (
          <svg viewBox="0 0 300 200" className={`w-full h-full ${className}`}>
            <rect width="300" height="200" fill="#87CEEB" />
            <rect x="0" y="150" width="300" height="50" fill="#90EE90" />
            <rect x="50" y="100" width="8" height="50" fill="#8B4513" />
            <rect x="100" y="100" width="8" height="50" fill="#8B4513" />
            <rect x="50" y="100" width="58" height="8" fill="#8B4513" />
            <circle cx="200" cy="70" r="15" fill="#ffdbac" />
            <rect x="190" y="85" width="20" height="35" fill="#ff69b4" />
            <text x="150" y="190" textAnchor="middle" className="text-lg font-bold fill-gray-700">Playground</text>
          </svg>
        );
      
      case 'Girl Eating':
        return (
          <svg viewBox="0 0 300 200" className={`w-full h-full ${className}`}>
            <rect width="300" height="200" fill="#fff8dc" />
            <circle cx="150" cy="70" r="20" fill="#ffdbac" />
            <rect x="140" y="90" width="20" height="40" fill="#ff69b4" />
            <rect x="145" y="65" width="10" height="15" fill="#8B4513" />
            <rect x="170" y="95" width="15" height="4" fill="#8B4513" />
            <circle cx="185" cy="97" r="3" fill="#ff4444" />
            <text x="150" y="185" textAnchor="middle" className="text-lg font-bold fill-gray-700">Girl Eating</text>
          </svg>
        );
      
      case 'Cat on Table':
        return (
          <svg viewBox="0 0 300 200" className={`w-full h-full ${className}`}>
            <rect width="300" height="200" fill="#f0f8ff" />
            <rect x="80" y="120" width="140" height="60" fill="#8B4513" />
            <rect x="75" y="180" width="8" height="20" fill="#8B4513" />
            <rect x="217" y="180" width="8" height="20" fill="#8B4513" />
            <ellipse cx="150" cy="100" rx="25" ry="15" fill="#ffa500" />
            <circle cx="140" cy="95" r="3" fill="#333" />
            <circle cx="160" cy="95" r="3" fill="#333" />
            <text x="150" y="185" textAnchor="middle" className="text-lg font-bold fill-gray-700">Cat on Table</text>
          </svg>
        );
      
      case 'Sad Boy Broken Toy':
        return (
          <svg viewBox="0 0 300 200" className={`w-full h-full ${className}`}>
            <rect width="300" height="200" fill="#f5f5f5" />
            <circle cx="120" cy="60" r="15" fill="#ffdbac" />
            <rect x="110" y="75" width="20" height="35" fill="#4169E1" />
            <circle cx="115" cy="55" r="2" fill="#333" />
            <circle cx="125" cy="55" r="2" fill="#333" />
            <ellipse cx="120" cy="65" rx="3" ry="1" fill="#333" />
            <rect x="180" y="120" width="15" height="15" fill="#ff4444" />
            <line x1="175" y1="115" x2="200" y2="140" stroke="#333" strokeWidth="2" />
            <text x="150" y="185" textAnchor="middle" className="text-lg font-bold fill-gray-700">Sad Boy</text>
          </svg>
        );
      
      case 'Sequence 1-2-3':
        return (
          <svg viewBox="0 0 300 200" className={`w-full h-full ${className}`}>
            <rect width="300" height="200" fill="#f0f8ff" />
            <rect x="20" y="50" width="80" height="100" fill="#e6f3ff" stroke="#4169E1" strokeWidth="2" />
            <rect x="110" y="50" width="80" height="100" fill="#e6f3ff" stroke="#4169E1" strokeWidth="2" />
            <rect x="200" y="50" width="80" height="100" fill="#e6f3ff" stroke="#4169E1" strokeWidth="2" />
            <text x="60" y="110" textAnchor="middle" className="text-2xl font-bold fill-blue-700">1</text>
            <text x="150" y="110" textAnchor="middle" className="text-2xl font-bold fill-blue-700">2</text>
            <text x="240" y="110" textAnchor="middle" className="text-2xl font-bold fill-blue-700">3</text>
            <text x="150" y="185" textAnchor="middle" className="text-lg font-bold fill-gray-700">Sequence</text>
          </svg>
        );
      
      case 'Story Continuation':
        return (
          <svg viewBox="0 0 300 200" className={`w-full h-full ${className}`}>
            <rect width="300" height="200" fill="#fff8dc" />
            <rect x="50" y="60" width="200" height="80" fill="#ffeaa7" stroke="#ddd" strokeWidth="2" />
            <text x="150" y="90" textAnchor="middle" className="text-sm font-bold fill-gray-700">Story continues...</text>
            <text x="150" y="110" textAnchor="middle" className="text-sm fill-gray-600">What happens next?</text>
            <text x="150" y="185" textAnchor="middle" className="text-lg font-bold fill-gray-700">Story</text>
          </svg>
        );
      
      default:
        return (
          <svg viewBox="0 0 300 200" className={`w-full h-full ${className}`}>
            <rect width="300" height="200" fill="#f0f0f0" />
            <text x="150" y="100" textAnchor="middle" className="text-lg font-bold fill-gray-700">{type}</text>
          </svg>
        );
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
      {renderImage()}
    </div>
  );
};

export default OralLanguageImage;