import React from 'react';
import { SavedInterviewSession } from '../types';
import { ClockIcon, DocumentTextIcon, TrashIcon } from './icons';

interface PastSessionsListProps {
  sessions: SavedInterviewSession[];
  onView: (session: SavedInterviewSession) => void;
  onDelete: (sessionId: string) => void;
}

const PastSessionsList: React.FC<PastSessionsListProps> = ({ sessions, onView, onDelete }) => {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 px-4 bg-brand-input rounded-2xl">
        <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-400" />
        <h3 className="mt-2 text-lg font-semibold text-brand-text-dark">No Past Sessions</h3>
        <p className="mt-1 text-sm text-brand-text-light">Your completed interview sessions will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <div key={session.id} className="bg-white p-4 rounded-2xl border border-gray-200/80 flex items-center justify-between gap-4 transition-shadow hover:shadow-md animate-fade-in-scale">
          <div className="flex-grow overflow-hidden">
            <h4 className="font-bold text-brand-text-dark truncate" title={session.jobTitle}>
              {session.jobTitle}
            </h4>
            <div className="flex items-center flex-wrap gap-x-2 text-sm text-brand-text-light mt-1">
              <div className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4" />
                <span>{new Date(session.date).toLocaleDateString()}</span>
              </div>
              <span className="text-gray-300 hidden sm:inline">•</span>
              <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium">{session.interviewType}</span>
              <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium">{session.difficulty}</span>
            </div>
          </div>
          <div className="flex-shrink-0 flex items-center gap-2">
            <button
              onClick={() => onView(session)}
              className="px-4 py-2 bg-brand-accent-green-light text-brand-accent-green font-semibold rounded-lg text-sm hover:bg-brand-accent-green/20 transition-colors"
              aria-label={`View report for ${session.jobTitle}`}
            >
              View Report
            </button>
            <button
              onClick={() => onDelete(session.id)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-full transition-colors"
              aria-label={`Delete session for ${session.jobTitle}`}
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PastSessionsList;