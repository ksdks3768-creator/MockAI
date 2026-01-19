
import React from 'react';
import { SavedInterviewSession, InterviewResult } from '../types';
import PastSessionsList from './PastSessionsList';

interface HistoryScreenProps {
  sessions: SavedInterviewSession[];
  onViewSession: (results: InterviewResult[]) => void;
  onDeleteSession: (id: string) => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ sessions, onViewSession, onDeleteSession }) => {
  return (
    <div className="p-8 space-y-6 animate-fade-in-scale">
      <div>
        <h1 className="text-3xl font-bold text-brand-text-dark">Activity History</h1>
        <p className="text-brand-text-light mt-1">Review your past performances and feedback.</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
        <div className="p-6">
           <PastSessionsList
            sessions={sessions}
            onView={(s) => onViewSession(s.results)}
            onDelete={onDeleteSession}
          />
        </div>
      </div>
    </div>
  );
};

export default HistoryScreen;
