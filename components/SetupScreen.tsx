import React, { useState } from 'react';
import { InterviewType, InterviewDifficulty } from '../types';
import { LoadingSpinner, LogoIcon, SendIcon, UserCircleIcon, CodeBracketIcon, UsersIcon } from './icons';

interface SetupScreenProps {
  onStart: (jd: string, type: InterviewType, difficulty: InterviewDifficulty) => void;
  isLoading: boolean;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart, isLoading }) => {
  const [jd, setJd] = useState('');
  const [interviewType, setInterviewType] = useState<InterviewType>(InterviewType.TECHNICAL);
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>(InterviewDifficulty.MEDIUM);

  const handleStart = () => {
    if (jd.trim() && !isLoading) {
      onStart(jd, interviewType, difficulty);
    }
  };

  const interviewTypes = [
    { type: InterviewType.HR, icon: <UserCircleIcon className="w-8 h-8" />, label: 'HR' },
    { type: InterviewType.TECHNICAL, icon: <CodeBracketIcon className="w-8 h-8" />, label: 'Technical' },
    { type: InterviewType.PANEL, icon: <UsersIcon className="w-8 h-8" />, label: 'Panel' },
  ];

  const difficultyLevels = [
    { level: InterviewDifficulty.EASY, color: 'text-green-600', bgColor: 'bg-green-100', borderColor: 'border-green-600' },
    { level: InterviewDifficulty.MEDIUM, color: 'text-yellow-600', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-600' },
    { level: InterviewDifficulty.HARD, color: 'text-red-600', bgColor: 'bg-red-100', borderColor: 'border-red-600' },
  ];

  return (
    <div className="w-full max-w-md mx-auto p-4 md:p-0 min-h-screen flex flex-col justify-between">
      <header className="flex justify-between items-center py-4">
        <LogoIcon className="w-8 h-8 text-brand-text-dark" />
        {/* Settings icon removed for a cleaner, more direct UI */}
      </header>

      <main className="flex-grow flex flex-col justify-center">
        {isLoading ? (
          <div className="space-y-6 animate-pulse">
            {/* Skeleton for Main card */}
            <div className="bg-brand-card p-6 rounded-3xl shadow-sm border border-gray-200/50 space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-8 bg-gray-300 rounded w-5/6 mb-2"></div>
              <div className="h-32 bg-brand-input rounded-2xl"></div>
            </div>

            {/* Skeleton for Interview type selection */}
            <div>
              <div className="h-6 bg-gray-300 rounded w-1/2 mb-3"></div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 h-24 bg-white border border-gray-200 rounded-2xl"></div>
                <div className="flex-1 h-24 bg-white border border-gray-200 rounded-2xl"></div>
                <div className="flex-1 h-24 bg-white border border-gray-200 rounded-2xl"></div>
              </div>
            </div>
            
            {/* Skeleton for Difficulty selection */}
            <div>
              <div className="h-6 bg-gray-300 rounded w-1/2 mb-3"></div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 h-14 bg-white border border-gray-200 rounded-2xl"></div>
                <div className="flex-1 h-14 bg-white border border-gray-200 rounded-2xl"></div>
                <div className="flex-1 h-14 bg-white border border-gray-200 rounded-2xl"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Main reflection card */}
            <div className="bg-brand-card p-6 rounded-3xl shadow-sm border border-gray-200/50 space-y-4">
              <p className="text-sm font-medium text-brand-text-light">AI Interview Coach</p>
              <h1 className="text-3xl font-bold tracking-tight text-brand-text-dark">
                Ready to ace your next interview?
              </h1>
              <div className="relative">
                <textarea
                  rows={6}
                  className="w-full p-4 bg-brand-input border border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-accent-green focus:border-brand-accent-green transition duration-200 resize-none placeholder:text-brand-text-light"
                  placeholder="Paste job description here..."
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Interview type selection */}
            <div>
              <h2 className="text-lg font-bold text-brand-text-dark mb-3">Select Interview Type</h2>
              <div className="flex items-center justify-between gap-3">
                {interviewTypes.map(({ type, icon, label }) => (
                  <button
                    key={type}
                    onClick={() => setInterviewType(type)}
                    disabled={isLoading}
                    className={`flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 ${
                      interviewType === type
                        ? 'bg-brand-accent-green-light border-brand-accent-green text-brand-accent-green'
                        : 'bg-white border-gray-200 text-brand-text-light hover:border-gray-300'
                    }`}
                  >
                    {icon}
                    <span className="font-semibold text-sm">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty selection */}
            <div>
              <h2 className="text-lg font-bold text-brand-text-dark mb-3">Select Difficulty</h2>
              <div className="flex items-center justify-between gap-3">
                {difficultyLevels.map(({ level, color, bgColor, borderColor }) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    disabled={isLoading}
                    className={`flex-1 flex items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 font-semibold ${
                      difficulty === level
                        ? `${bgColor} ${borderColor} ${color}`
                        : 'bg-white border-gray-200 text-brand-text-light hover:border-gray-300'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-4">
          <button
            onClick={handleStart}
            disabled={!jd.trim() || isLoading}
            className="w-full flex justify-center items-center gap-3 bg-brand-text-dark text-white font-bold py-4 px-4 rounded-2xl hover:bg-black transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <LoadingSpinner className="w-5 h-5" />
                Generating Your Interview...
              </>
            ) : (
              <>
              <SendIcon className="w-5 h-5" />
              Start Your Mock Interview
              </>
            )}
          </button>
      </footer>
    </div>
  );
};

export default SetupScreen;
