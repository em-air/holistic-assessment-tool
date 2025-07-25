import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white py-8">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-green-400"></div>
          </div>
        </div>
        <p className="text-gray-600 text-sm font-medium tracking-wider uppercase mb-2">
          BLOOM TUTORING
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          Bloom Tutoring Holistic Assessment
        </h1>
      </div>
    </header>
  );
};

export default Header;