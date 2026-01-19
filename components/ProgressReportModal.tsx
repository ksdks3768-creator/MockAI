
import React from 'react';
import { InterviewResult } from '../types';
import ProgressCard from './ProgressCard';
import { XCircleIcon, ArrowDownTrayIcon } from './icons';
import { exportReportToText } from '../utils/exportUtils';

interface ProgressReportModalProps {
  onClose: () => void;
  results: InterviewResult[];
}

const ProgressReportModal: React.FC<ProgressReportModalProps> = ({ onClose, results }) => {
  const totalScore = results.reduce((acc, result) => acc + result.feedback.score, 0);
  const averageScore = results.length > 0 ? (totalScore / (results.length * 10)) * 100 : 0;
  const jobTitle = results[0]?.question ? "Mock Interview" : "Report"; // Fallback job title

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-end sm:items-center z-50 p-0 sm:p-4 transition-opacity animate-fade-in-scale"
      onClick={onClose}
    >
      <div 
        className="bg-brand-bg rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-3xl h-[95vh] sm:h-auto sm:max-h-[90vh] overflow-y-auto relative p-4 sm:p-6 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center sticky top-0 bg-brand-bg/95 backdrop-blur-sm pb-3 z-10 border-b border-gray-100 sm:border-0">
            <h1 className="text-xl sm:text-3xl font-bold text-brand-text-dark">Performance Report</h1>
            <div className="flex items-center gap-2 sm:gap-3">
                <button 
                    onClick={() => exportReportToText(results, jobTitle)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-accent-green-light text-brand-accent-green font-bold rounded-xl hover:bg-brand-accent-green hover:text-white transition-all text-xs sm:text-sm"
                >
                    <ArrowDownTrayIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    TXT
                </button>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <XCircleIcon className="w-7 h-7 sm:w-8 sm:h-8" />
                </button>
            </div>
        </div>
        
        <ProgressCard score={averageScore} />

        <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-brand-text-dark border-b pb-2">Detailed Feedback</h2>
            {results.map((result, index) => (
                <div key={index} className="p-4 bg-brand-card rounded-2xl border border-gray-200/80 shadow-sm">
                    <div className="flex justify-between items-start gap-2">
                        <div className="pr-2 flex-1">
                            <h3 className="font-bold text-base sm:text-lg text-brand-text-dark">Q: {result.question.question}</h3>
                            <p className="text-xs text-brand-text-light mt-1">Persona: {result.question.persona}</p>
                        </div>
                        <div className="flex-shrink-0 px-2.5 py-1 text-xs font-bold rounded-full bg-brand-accent-green-light text-brand-accent-green border border-brand-accent-green/30">
                            {result.feedback.score}/10
                        </div>
                    </div>

                    <p className="italic text-brand-text-light text-sm my-3 border-l-2 border-brand-accent-green-light pl-3">"{result.answer}"</p>
                    
                    <details className="mt-2 group border-t border-gray-100 pt-2">
                        <summary className="cursor-pointer text-brand-accent-green text-sm font-semibold hover:underline list-none flex items-center justify-between">
                            View Deep Analysis
                            <span className="group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <div className="mt-4 space-y-4 text-sm">
                            <div className="flex flex-wrap gap-2">
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                                    result.feedback.rating === 'Advanced' ? 'bg-green-100 text-green-700 border-green-200' :
                                    result.feedback.rating === 'Intermediate' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                    'bg-red-100 text-red-700 border-red-200'
                                }`}>{result.feedback.rating}</span>
                            </div>

                            <div>
                                <h4 className="font-bold text-green-600 text-xs uppercase tracking-wider mb-1">Keywords Matched</h4>
                                <p className="text-brand-text-light">{result.feedback.matchedKeywords.join(', ') || 'None'}</p>
                            </div>

                            <div>
                                <h4 className="font-bold text-yellow-600 text-xs uppercase tracking-wider mb-1">Keywords Missed</h4>
                                <p className="text-brand-text-light">{result.feedback.missedKeywords.join(', ') || 'None'}</p>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <h4 className="font-bold text-green-600 text-xs uppercase tracking-wider">Strengths</h4>
                                    <ul className="list-disc list-inside text-brand-text-light text-xs space-y-1">
                                        {result.feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-yellow-600 text-xs uppercase tracking-wider">Improvements</h4>
                                    <ul className="list-disc list-inside text-brand-text-light text-xs space-y-1">
                                        {result.feedback.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </details>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressReportModal;
