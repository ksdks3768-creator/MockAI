
import React from 'react';
import { SavedInterviewSession, AppState } from '../types';
import { StarIcon, SendIcon, ClockIcon, UsersIcon } from './icons';

interface DashboardScreenProps {
  sessions: SavedInterviewSession[];
  onStartNew: () => void;
  onViewHistory: () => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ sessions, onStartNew, onViewHistory }) => {
  const totalInterviews = sessions.length;
  const avgScore = totalInterviews > 0 
    ? (sessions.reduce((acc, s) => acc + (s.results.reduce((rAcc, r) => rAcc + r.feedback.score, 0) / (s.results.length || 1)), 0) / totalInterviews).toFixed(1)
    : 0;
  
  const recentSessions = sessions.slice(0, 3);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 animate-fade-in-scale pb-24 md:pb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-text-dark">Welcome back!</h1>
        <p className="text-brand-text-light mt-1">Ready to refine your interview skills today?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-sm">
          <div className="w-10 h-10 bg-brand-accent-green-light text-brand-accent-green rounded-xl flex items-center justify-center mb-4">
            <UsersIcon className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-brand-text-light">Total Interviews</p>
          <p className="text-2xl sm:text-3xl font-bold text-brand-text-dark mt-1">{totalInterviews}</p>
        </div>
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-sm">
          <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center mb-4">
            <StarIcon className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-brand-text-light">Average Score</p>
          <p className="text-2xl sm:text-3xl font-bold text-brand-text-dark mt-1">{avgScore}<span className="text-lg text-gray-400">/10</span></p>
        </div>
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <ClockIcon className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-brand-text-light">Practice Hours</p>
          <p className="text-2xl sm:text-3xl font-bold text-brand-text-dark mt-1">{(totalInterviews * 0.4).toFixed(1)}h</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-brand-text-dark">Recent Activity</h2>
            <button onClick={onViewHistory} className="text-sm font-bold text-brand-accent-green hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {recentSessions.length > 0 ? (
              recentSessions.map(session => (
                <div key={session.id} className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center justify-between gap-2">
                  <div className="overflow-hidden">
                    <p className="font-bold text-brand-text-dark truncate">{session.jobTitle}</p>
                    <p className="text-xs text-brand-text-light">{new Date(session.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold text-brand-accent-green bg-brand-accent-green-light px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
                    {session.interviewType}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-brand-input p-8 rounded-2xl text-center">
                <p className="text-brand-text-light">No interviews recorded yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-brand-text-dark text-white p-6 sm:p-8 rounded-3xl flex flex-col justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">New Practice Session</h2>
            <p className="text-gray-400 text-sm sm:text-base">Generate a custom interview based on any job description instantly with our lite-latency AI model.</p>
          </div>
          <button 
            onClick={onStartNew}
            className="mt-6 sm:mt-8 flex items-center justify-center gap-3 bg-brand-accent-green hover:bg-brand-accent-green/90 text-white font-bold py-3 sm:py-4 rounded-2xl transition-all"
          >
            <SendIcon className="w-5 h-5" />
            Start Interview Wizard
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;
