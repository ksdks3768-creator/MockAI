
import React from 'react';
import { HomeIcon, GridIcon, ArrowDownTrayIcon } from './icons';
import { InterviewResult } from '../types';
import { exportReportToText } from '../utils/exportUtils';

interface CompletionScreenProps {
    onReset: () => void;
    onViewReport: () => void;
    results: InterviewResult[];
    jobTitle?: string;
}

const CompletionScreen: React.FC<CompletionScreenProps> = ({ onReset, onViewReport, results, jobTitle = 'Interview' }) => {
    return (
        <div className="w-full h-full mx-auto p-6 flex flex-col items-center justify-center text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-brand-text-dark leading-tight">Interview Complete!</h1>
            <p className="text-brand-text-light mt-4 text-lg max-w-md">
                Congratulations on finishing your practice session. You're one step closer to your goal!
            </p>
            <p className="text-brand-text-light mt-2 text-sm">
                View your detailed report or start a new interview using the controls below.
            </p>

            {/* Floating Nav Bar */}
            <div className="fixed bottom-12 md:bottom-8 left-1/2 -translate-x-1/2 z-40 w-fit pb-[env(safe-area-inset-bottom)]">
              <div className="flex items-center gap-3 bg-white/90 backdrop-blur-xl shadow-2xl shadow-black/5 rounded-full p-2 border border-white">
                <button 
                  onClick={onReset}
                  className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-brand-text-dark rounded-full text-white shadow-xl transform active:scale-95 transition-transform"
                  aria-label="Start New Interview"
                >
                  <HomeIcon className="w-6 h-6 md:w-8 md:h-8" />
                </button>
                <button 
                  onClick={onViewReport}
                  className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-gray-100 rounded-full text-brand-text-light transform active:scale-95 hover:bg-gray-200 hover:text-brand-text-dark transition-all"
                   aria-label="View Report"
                >
                  <GridIcon className="w-6 h-6 md:w-7 md:h-7" />
                </button>
                <button 
                  onClick={() => exportReportToText(results, jobTitle)}
                  className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-brand-accent-green-light rounded-full text-brand-accent-green transform active:scale-95 hover:bg-brand-accent-green hover:text-white transition-all"
                   aria-label="Export Report as Text"
                >
                  <ArrowDownTrayIcon className="w-6 h-6 md:w-7 md:h-7" />
                </button>
              </div>
            </div>
        </div>
    );
};

export default CompletionScreen;