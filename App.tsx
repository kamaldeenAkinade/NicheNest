import React, { useState, useEffect } from 'react';
import { fetchTopKeywords, fetchKeywordDetails } from './services/geminiService';
import { Keyword, KeywordDetails, TimeRange } from './types';
import KeywordCard from './components/BookCard';
import Spinner from './components/Spinner';

const PAGE_SIZE = 12;

const NicheNestLogo: React.FC = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block mr-3">
    <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 7L12 12L22 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 12V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 4.5L7 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const KeywordDetailsComponent: React.FC<{ keyword: string; onBack: () => void }> = ({ keyword, onBack }) => {
  const [details, setDetails] = useState<KeywordDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedDetails = await fetchKeywordDetails(keyword);
        setDetails(fetchedDetails);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };
    loadDetails();
  }, [keyword]);

  const renderDetailsContent = () => {
    if (isLoading) return <Spinner />;
    if (error) return <div className="text-center p-8 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg"><h2 className="text-2xl font-bold">Error</h2><p>{error}</p></div>;
    if (!details) return <div className="text-center p-8 text-gray-500 dark:text-gray-400">No details found.</div>;

    return (
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Related Keywords</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="p-3 font-semibold text-sm">Keyword</th>
                  <th className="p-3 font-semibold text-sm">Volume</th>
                  <th className="p-3 font-semibold text-sm">Competitors</th>
                  <th className="p-3 font-semibold text-sm">Type</th>
                </tr>
              </thead>
              <tbody>
                {details.relatedKeywords.map((kw, i) => (
                  <tr key={i} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="p-3">{kw.keyword}</td>
                    <td className="p-3">{kw.volume.toLocaleString()}</td>
                    <td className="p-3">{kw.competitors.toLocaleString()}</td>
                    <td className="p-3 capitalize">{kw.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Profitable Topic Ideas</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            {details.profitableTopics.map((topic, i) => <li key={i}>{topic}</li>)}
          </ul>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Tips for Authors</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            {details.authorTips.map((tip, i) => <li key={i}>{tip}</li>)}
          </ul>
        </div>
      </div>
    );
  };
  
  return (
    <div>
      <button onClick={onBack} className="mb-8 inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline">
         &larr; Back to Keywords
      </button>
      <h2 className="text-3xl font-bold text-center mb-6">Insights for "{keyword}"</h2>
      {renderDetailsContent()}
    </div>
  );
};

const filterOptions: { label: string; value: TimeRange }[] = [
  { label: '24 Hours', value: '24hours' },
  { label: 'Last Week', value: 'week' },
  { label: 'Last Month', value: 'month' },
  { label: '3 Months', value: '3months' },
];

const App: React.FC = () => {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('24hours');
  const [showLowCompetitionOnly, setShowLowCompetitionOnly] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMoreResults, setHasMoreResults] = useState<boolean>(true);

  useEffect(() => {
    if (selectedKeyword === null) {
      const loadKeywords = async () => {
        try {
          setIsLoading(true);
          setError(null);
          const fetchedKeywords = await fetchTopKeywords(timeRange, showLowCompetitionOnly, currentPage);
          setKeywords(fetchedKeywords);
          setHasMoreResults(fetchedKeywords.length === PAGE_SIZE);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
          setIsLoading(false);
        }
      };
      loadKeywords();
    }
  }, [selectedKeyword, timeRange, showLowCompetitionOnly, currentPage]);

  const handleTimeRangeChange = (newTimeRange: TimeRange) => {
    setTimeRange(newTimeRange);
    setCurrentPage(1);
    setHasMoreResults(true);
  };

  const handleLowCompetitionToggle = () => {
    setShowLowCompetitionOnly(prev => !prev);
    setCurrentPage(1);
    setHasMoreResults(true);
  };

  const renderContent = () => {
    if (isLoading) return <Spinner />;
    if (error) return <div className="text-center p-8 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg"><h2 className="text-2xl font-bold">Oops! Something went wrong.</h2><p>{error}</p></div>;
    if (selectedKeyword) {
      return <KeywordDetailsComponent keyword={selectedKeyword} onBack={() => setSelectedKeyword(null)} />;
    }
    if (keywords.length === 0) return <div className="text-center p-8 text-gray-500 dark:text-gray-400"><h2 className="text-2xl font-bold">No keywords found.</h2><p>Please try a different filter or try again later.</p></div>;

    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {keywords.map((kw, index) => (
            <KeywordCard key={`${kw.keyword}-${index}`} keywordData={kw} onClick={() => setSelectedKeyword(kw.keyword)} />
          ))}
        </div>
        <div className="mt-12 flex justify-center items-center gap-4">
            <button
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={currentPage === 1 || isLoading}
              className="px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              &larr; Previous
            </button>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Page {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={!hasMoreResults || isLoading}
              className="px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              Next &rarr;
            </button>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {!selectedKeyword && (
          <header className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight flex items-center justify-center">
              <NicheNestLogo />
              NicheNest
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Uncover Profitable Book Niches on Amazon
            </p>
            <div className="mt-8 flex justify-center flex-wrap gap-2 sm:gap-4" role="group" aria-label="Time range filter">
              {filterOptions.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => handleTimeRangeChange(value)}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-blue-500 ${
                    timeRange === value
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  aria-pressed={timeRange === value}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-center items-center gap-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300" id="low-competition-label">
                Low-Competition Mode
              </span>
              <button
                onClick={handleLowCompetitionToggle}
                role="switch"
                aria-checked={showLowCompetitionOnly}
                aria-labelledby="low-competition-label"
                className={`${
                  showLowCompetitionOnly ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                <span
                  aria-hidden="true"
                  className={`${
                    showLowCompetitionOnly ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>
          </header>
        )}
        {renderContent()}
      </main>
      <footer className="text-center py-6 mt-8 border-t border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">Powered by Gemini</p>
      </footer>
    </div>
  );
};

export default App;
