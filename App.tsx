import React, { useState, useCallback } from 'react';
import { AppState, InterviewType, InterviewQuestion, InterviewResult, InterviewDifficulty } from './types';
import * as geminiService from './services/geminiService';
import SetupScreen from './components/SetupScreen';
import InterviewScreen from './components/InterviewScreen';
import ProgressReportModal from './components/ProgressReportModal';
import { HomeIcon, GridIcon } from './components/icons';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.SETUP);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [results, setResults] = useState<InterviewResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const handleStartInterview = useCallback(async (jd: string, type: InterviewType, difficulty: InterviewDifficulty) => {
    setAppState(AppState.GENERATING);
    setError(null);
    try {
      const jobDetails = await geminiService.parseJobDescription(jd);
      const generatedQuestions = await geminiService.generateQuestions(jobDetails, type, difficulty);
      if (generatedQuestions && generatedQuestions.length > 0) {
        setQuestions(generatedQuestions);
        setResults([]);
        setAppState(AppState.INTERVIEW);
      } else {
        throw new Error("The AI failed to generate questions. Please try again with a clearer job description.");
      }
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred while setting up the interview.";
      setError(errorMessage);
      setAppState(AppState.SETUP);
    }
  }, []);

  const resetInterview = () => {
    setAppState(AppState.SETUP);
    setQuestions([]);
    setResults([]);
    setError(null);
    setIsReportModalOpen(false);
  }

  const renderContent = () => {
    switch (appState) {
      case AppState.SETUP:
      case AppState.GENERATING:
        return (
            <div className="w-full">
                 {error && <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-800 rounded-2xl text-center">{error}</div>}
                 <SetupScreen onStart={handleStartInterview} isLoading={appState === AppState.GENERATING} />
            </div>
        );
      case AppState.INTERVIEW:
      case AppState.ANALYZING:
      case AppState.FEEDBACK:
        return <InterviewScreen questions={questions} setResults={setResults} setAppState={setAppState} />;
      
      case AppState.COMPLETE:
        return (
            <div className="w-full max-w-2xl mx-auto p-4 md:p-0 flex flex-col items-center justify-center text-center min-h-[calc(100vh-100px)]">
                <h1 className="text-5xl font-bold text-brand-text-dark">Interview Complete!</h1>
                <p className="text-brand-text-light mt-4 text-lg">
                    Congratulations on finishing your practice session. You're one step closer to your goal!
                </p>
                <p className="text-brand-text-light mt-2">
                    View your detailed report or start a new interview using the controls below.
                </p>

                {/* Floating Nav Bar */}
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
                  <div className="flex items-center gap-2 bg-white/70 backdrop-blur-md shadow-2xl shadow-gray-500/10 rounded-full p-2 border border-gray-200/80">
                    <button 
                      onClick={resetInterview}
                      className="flex items-center justify-center w-16 h-16 bg-brand-text-dark rounded-full text-white shadow-lg transform hover:scale-105 transition-transform"
                      aria-label="Start New Interview"
                    >
                      <HomeIcon className="w-8 h-8" />
                    </button>
                    <button 
                      onClick={() => setIsReportModalOpen(true)}
                      className="flex items-center justify-center w-14 h-14 bg-gray-100 rounded-full text-brand-text-light transform hover:scale-105 hover:bg-gray-200 hover:text-brand-text-dark transition-all"
                       aria-label="View Report"
                    >
                      <GridIcon className="w-7 h-7" />
                    </button>
                  </div>
                </div>

                <ProgressReportModal 
                    isOpen={isReportModalOpen}
                    onClose={() => setIsReportModalOpen(false)}
                    results={results}
                />
            </div>
        );
      default:
        return <div>Invalid state</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 selection:bg-brand-accent-green/30 font-sans bg-brand-bg text-brand-text-dark">
      <main className="w-full flex items-center justify-center">
        {renderContent()}
      </main>
      <footer className="text-center mt-8 text-sm text-gray-400">
        <p>&copy; 2024 AI Interview Coach. Powered by Google Gemini.</p>
      </footer>
    </div>
  );
};

export default App;