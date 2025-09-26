import React from 'react';
import { InterviewResult } from '../types';
import ProgressCard from './ProgressCard';
import { XCircleIcon } from './icons';

interface ProgressReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: InterviewResult[];
}

const ProgressReportModal: React.FC<ProgressReportModalProps> = ({ isOpen, onClose, results }) => {
  if (!isOpen) {
    return null;
  }

  const totalScore = results.reduce((acc, result) => acc + result.feedback.score, 0);
  const averageScore = results.length > 0 ? (totalScore / (results.length * 10)) * 100 : 0;

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity animate-[fade-in_0.3s_ease-out]"
      onClick={onClose}
      style={{ animationName: 'fade-in', animationDuration: '0.3s' }}
    >
      <div 
        className="bg-brand-bg rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative p-6 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10">
          <XCircleIcon className="w-8 h-8" />
        </button>

        <h1 className="text-3xl font-bold text-center text-brand-text-dark">Your Performance Report</h1>
        
        <ProgressCard score={averageScore} />

        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-brand-text-dark border-b pb-2">Detailed Feedback</h2>
            {results.map((result, index) => (
                <div key={index} className="p-4 bg-brand-card rounded-2xl border border-gray-200/80">
                    <div className="flex justify-between items-start">
                        <div className="pr-4">
                            <h3 className="font-bold text-lg text-brand-text-dark">Q: {result.question.question}</h3>
                            <p className="text-sm text-brand-text-light mb-2">Asker: {result.question.persona}</p>
                        </div>
                        <div className="flex-shrink-0 ml-4 px-3 py-1 text-sm font-bold rounded-full bg-brand-accent-green-light text-brand-accent-green border border-brand-accent-green/50">
                            {result.feedback.score}/10
                        </div>
                    </div>

                    <p className="italic text-brand-text-light my-2">Your Answer: "{result.answer}"</p>
                    <details className="mt-2 group">
                        <summary className="cursor-pointer text-brand-accent-green font-semibold hover:underline">View Detailed Feedback</summary>
                        <div className="mt-4 p-4 bg-brand-input rounded-xl space-y-3">
                            <div className="mb-2">
                                <span className={`px-2 py-1 text-xs font-bold rounded-full border ${
                                    result.feedback.rating === 'Advanced' ? 'bg-green-100 text-green-700 border-green-200' :
                                    result.feedback.rating === 'Intermediate' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                    'bg-red-100 text-red-700 border-red-200'
                                }`}>{result.feedback.rating}</span>
                            </div>

                            <h4 className="font-semibold text-green-600">Keywords Matched:</h4>
                            <p className="text-brand-text-light text-sm">{result.feedback.matchedKeywords.join(', ') || 'None'}</p>

                            <h4 className="font-semibold text-yellow-600">Keywords Missed:</h4>
                            <p className="text-brand-text-light text-sm">{result.feedback.missedKeywords.join(', ') || 'None'}</p>
                            
                            <h4 className="font-semibold text-green-600">Strengths:</h4>
                            <ul className="list-disc list-inside text-brand-text-light">
                                {result.feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                            <h4 className="font-semibold text-yellow-600">Improvements:</h4>
                            <ul className="list-disc list-inside text-brand-text-light">
                                {result.feedback.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                            </ul>
                        </div>
                    </details>
                </div>
            ))}
        </div>
      </div>
       <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ProgressReportModal;