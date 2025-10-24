import React from 'react';
import { Keyword } from '../types';

interface KeywordCardProps {
  keywordData: Keyword;
  onClick: () => void;
}

const KeywordCard: React.FC<KeywordCardProps> = ({ keywordData, onClick }) => {
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out flex flex-col p-6 cursor-pointer group"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onClick()}
      aria-label={`View insights for ${keywordData.keyword}`}
    >
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 truncate" title={keywordData.keyword}>
        {keywordData.keyword}
      </h3>
      
      <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <span className="font-semibold mr-1">Volume:</span>
        <span>{keywordData.volume.toLocaleString()}</span>
      </div>
      
      <div className="flex items-center text-gray-600 dark:text-gray-400 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" />
        </svg>
        <span className="font-semibold mr-1">Revenue:</span>
        <span>{keywordData.revenue}</span>
      </div>

      <div className="mt-auto text-right">
        <span className="text-blue-600 dark:text-blue-400 font-semibold group-hover:underline">
          View Insights &rarr;
        </span>
      </div>
    </div>
  );
};

export default KeywordCard;
