
import React, { useState } from 'react';
import { InterviewType, InterviewDifficulty, InterviewResult, SupportedLanguage } from '../types';
import { LoadingSpinner, SendIcon, UserCircleIcon, CodeBracketIcon, UsersIcon, TrashIcon } from './icons';

interface SetupScreenProps {
  onStart: (jd: string, type: InterviewType, difficulty: InterviewDifficulty, language: SupportedLanguage, customQuestions: string[]) => void;
  isLoading: boolean;
  onViewPastSession: (results: InterviewResult[]) => void;
  error: string | null;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart, isLoading, error }) => {
  const [jd, setJd] = useState('');
  const [interviewType, setInterviewType] = useState<InterviewType>(InterviewType.TECHNICAL);
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>(InterviewDifficulty.MEDIUM);
  const [language, setLanguage] = useState<SupportedLanguage>(SupportedLanguage.ENGLISH);
  const [customQuestionInput, setCustomQuestionInput] = useState('');
  const [customQuestions, setCustomQuestions] = useState<string[]>([]);

  const handleStart = () => {
    if (jd.trim() && !isLoading) {
      onStart(jd, interviewType, difficulty, language, customQuestions);
    }
  };

  const addCustomQuestion = () => {
    if (customQuestionInput.trim()) {
      setCustomQuestions(prev => [...prev, customQuestionInput.trim()]);
      setCustomQuestionInput('');
    }
  };

  const removeCustomQuestion = (index: number) => {
    setCustomQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const interviewTypes = [
    { type: InterviewType.HR, icon: <UserCircleIcon className="w-7 h-7 sm:w-8 sm:h-8" />, label: 'HR' },
    { type: InterviewType.TECHNICAL, icon: <CodeBracketIcon className="w-7 h-7 sm:w-8 sm:h-8" />, label: 'Tech' },
    { type: InterviewType.PANEL, icon: <UsersIcon className="w-7 h-7 sm:w-8 sm:h-8" />, label: 'Panel' },
  ];

  const difficultyLevels = [
    { level: InterviewDifficulty.EASY, color: 'text-green-600', bgColor: 'bg-green-100', borderColor: 'border-green-600' },
    { level: InterviewDifficulty.MEDIUM, color: 'text-yellow-600', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-600' },
    { level: InterviewDifficulty.HARD, color: 'text-red-600', bgColor: 'bg-red-100', borderColor: 'border-red-600' },
    { level: InterviewDifficulty.EXPERT, color: 'text-purple-600', bgColor: 'bg-purple-100', borderColor: 'border-purple-600' },
  ];

  return (
    <div className="h-full w-full flex items-start justify-center p-4 sm:p-6 md:p-8 overflow-y-auto pb-24 md:pb-8">
      <div className="w-full max-w-3xl space-y-6 sm:space-y-8 animate-fade-in-scale">
        <header>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-text-dark">Interview Wizard</h1>
          <p className="text-brand-text-light mt-1">Configure your mock session for peak performance.</p>
        </header>

        {error && <div className="p-4 bg-red-100 border border-red-300 text-red-800 rounded-2xl text-sm">{error}</div>}
        
        {isLoading ? (
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-gray-200 flex flex-col items-center gap-4 text-center">
            <LoadingSpinner className="w-10 h-10 sm:w-12 sm:h-12 text-brand-accent-green" />
            <div className="space-y-2">
              <h2 className="text-lg sm:text-xl font-bold text-brand-text-dark">Curating Questions...</h2>
              <p className="text-brand-text-light text-sm sm:text-base">Our Lite AI is analyzing the role and generating targeted scenarios.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8 bg-white p-5 sm:p-8 rounded-3xl border border-gray-200 shadow-sm">
            <div className="space-y-4">
              <label className="text-base sm:text-lg font-bold text-brand-text-dark block">Job Description</label>
              <textarea
                rows={4}
                className="w-full p-4 bg-brand-input border border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-accent-green focus:border-brand-accent-green outline-none transition duration-200 resize-none text-sm sm:text-base"
                placeholder="Paste the job description or a simple role summary..."
                value={jd}
                onChange={(e) => setJd(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
               <div className="space-y-4">
                <label className="text-base sm:text-lg font-bold text-brand-text-dark block">Language</label>
                <select 
                  className="w-full p-3 bg-brand-input border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-accent-green font-semibold"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                >
                  {Object.values(SupportedLanguage).map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-base sm:text-lg font-bold text-brand-text-dark block">Difficulty</label>
                <div className="grid grid-cols-2 gap-2">
                  {difficultyLevels.map(({ level, color, bgColor, borderColor }) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`p-2 sm:p-3 rounded-2xl border-2 transition-all duration-200 font-bold text-xs sm:text-sm ${
                        difficulty === level ? `${bgColor} ${borderColor} ${color}` : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-base sm:text-lg font-bold text-brand-text-dark block">Format</label>
              <div className="grid grid-cols-3 gap-2">
                {interviewTypes.map(({ type, icon, label }) => (
                  <button
                    key={type}
                    onClick={() => setInterviewType(type)}
                    className={`flex flex-col items-center gap-2 p-2 sm:p-3 rounded-2xl border-2 transition-all duration-200 ${
                      interviewType === type ? 'bg-brand-accent-green-light border-brand-accent-green text-brand-accent-green' : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    {icon}
                    <span className="font-bold text-[10px] sm:text-xs uppercase tracking-wider">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-base sm:text-lg font-bold text-brand-text-dark block">Custom Questions <span className="text-xs sm:text-sm font-normal text-gray-400">(Optional)</span></label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  className="flex-1 p-3 sm:p-4 bg-brand-input border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-accent-green text-sm sm:text-base"
                  placeholder="Ask me about..."
                  value={customQuestionInput}
                  onChange={(e) => setCustomQuestionInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomQuestion()}
                />
                <button
                  onClick={addCustomQuestion}
                  className="px-6 py-3 bg-brand-accent-green text-white font-bold rounded-2xl hover:bg-brand-accent-green/90 transition-colors text-sm sm:text-base"
                >
                  Add
                </button>
              </div>
              {customQuestions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {customQuestions.map((q, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-brand-accent-green-light text-brand-accent-green rounded-full text-xs font-semibold">
                      <span className="truncate max-w-[120px] sm:max-w-[200px]">{q}</span>
                      <button onClick={() => removeCustomQuestion(i)}><TrashIcon className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={handleStart}
              disabled={!jd.trim() || isLoading}
              className="w-full bg-brand-text-dark text-white font-bold py-4 sm:py-5 rounded-2xl hover:bg-black transition-all disabled:bg-gray-400 text-base sm:text-lg shadow-xl"
            >
              Initialize Interview
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SetupScreen;
