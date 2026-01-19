import React from 'react';
import { AnswerFeedback } from '../types';
import { CheckCircleIcon, XCircleIcon, LightBulbIcon, StarIcon, AlertTriangleIcon, PlayIcon, PauseIcon, ReplayIcon } from './icons';

interface FeedbackCardProps {
  feedback: AnswerFeedback;
  userAnswer: string;
  speechState: 'idle' | 'playing' | 'paused' | 'ended';
  onToggleSpokenFeedback: () => void;
}

const RatingBadge: React.FC<{ rating: AnswerFeedback['rating'] }> = ({ rating }) => {
  const ratingStyles = {
    Beginner: 'bg-red-100 text-red-700 border-red-200',
    Intermediate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Advanced: 'bg-green-100 text-green-700 border-green-200',
  };
  return (
    <span className={`px-3 py-1 text-sm font-bold rounded-full border ${ratingStyles[rating]}`}>
      {rating}
    </span>
  );
};

const KeywordList: React.FC<{ title: string; keywords: string[]; icon: React.ReactNode; }> = ({ title, keywords, icon }) => (
  <div>
    <h4 className="font-semibold mb-2 flex items-center gap-2 text-brand-text-dark">{icon}{title}</h4>
    {keywords.length > 0 ? (
      <div className="flex flex-wrap gap-2">
        {keywords.map((kw, i) => <span key={i} className="px-2 py-1 bg-gray-200/60 text-brand-text-light text-sm rounded">{kw}</span>)}
      </div>
    ) : (
      <p className="text-sm text-brand-text-light italic">None</p>
    )}
  </div>
);

const HighlightedAnswer: React.FC<{ text: string; keywords: string[] }> = ({ text, keywords }) => {
    if (!keywords || keywords.length === 0) {
        return <p className="text-brand-text-light italic">"{text}"</p>;
    }
    const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
    const parts = text.split(regex);

    return (
        <p className="text-brand-text-light italic">
            "{parts.map((part, i) => 
                keywords.some(kw => new RegExp(kw, 'i').test(part)) ? (
                    <span key={i} className="bg-brand-accent-green-light text-brand-accent-green font-semibold rounded px-1 py-0.5">{part}</span>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}"
        </p>
    );
};


const FeedbackCard: React.FC<FeedbackCardProps> = ({ feedback, userAnswer, speechState, onToggleSpokenFeedback }) => {
  const getButtonLabel = () => {
    if (speechState === 'playing') return 'Pause spoken feedback';
    if (speechState === 'paused') return 'Resume spoken feedback';
    return 'Replay spoken feedback';
  }
  
  return (
    <div className="w-full bg-brand-card/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl p-6 space-y-6">
      <div className="relative flex justify-center items-center">
        <h2 className="text-2xl font-bold text-center text-brand-text-dark">Feedback Analysis</h2>
        <button
          onClick={onToggleSpokenFeedback}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-brand-accent-green-light flex items-center justify-center text-brand-accent-green hover:bg-brand-accent-green/20 transition-colors"
          aria-label={getButtonLabel()}
        >
          {speechState === 'playing' && <PauseIcon className="w-6 h-6" />}
          {speechState === 'paused' && <PlayIcon className="w-6 h-6" />}
          {(speechState === 'ended' || speechState === 'idle') && <ReplayIcon className="w-6 h-6" />}
        </button>
      </div>
      
      {/* Score and Rating */}
      <div className="flex justify-around items-center p-4 bg-brand-input rounded-2xl">
          <div className="flex flex-col items-center gap-2">
              <p className="text-sm font-medium text-brand-text-light">RATING</p>
              <RatingBadge rating={feedback.rating} />
          </div>
          <div className="flex flex-col items-center gap-2">
              <p className="text-sm font-medium text-brand-text-light">SCORE</p>
              <p className="text-4xl font-bold text-brand-accent-green">{feedback.score}<span className="text-2xl text-gray-400">/10</span></p>
          </div>
      </div>

      {/* Your Answer with Highlights */}
      <div className="bg-brand-input p-4 rounded-2xl">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-brand-text-dark">
          <StarIcon className="w-6 h-6 text-yellow-500" />
          Your Answer
        </h3>
        <HighlightedAnswer text={userAnswer} keywords={feedback.matchedKeywords} />
      </div>

      {/* Keyword Analysis */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-brand-input p-4 rounded-2xl">
          <KeywordList 
            title="Keywords You Mentioned"
            keywords={feedback.matchedKeywords}
            icon={<CheckCircleIcon className="w-5 h-5 text-green-500" />}
          />
        </div>
        <div className="bg-brand-input p-4 rounded-2xl">
          <KeywordList 
            title="Keywords to Include"
            keywords={feedback.missedKeywords}
            icon={<AlertTriangleIcon className="w-5 h-5 text-yellow-500" />}
          />
        </div>
      </div>

      {/* Strengths & Weaknesses */}
       <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-brand-input p-4 rounded-2xl">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-brand-text-dark"><CheckCircleIcon className="w-6 h-6 text-green-500" /> Strengths</h3>
            <ul className="space-y-2 list-disc list-inside text-brand-text-light">
            {feedback.strengths.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
        </div>
        <div className="bg-brand-input p-4 rounded-2xl">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-brand-text-dark"><XCircleIcon className="w-6 h-6 text-yellow-500" /> Areas for Improvement</h3>
            <ul className="space-y-2 list-disc list-inside text-brand-text-light">
            {feedback.weaknesses.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
        </div>
      </div>


      {/* Ideal Answer */}
      <div className="bg-brand-input p-4 rounded-2xl">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-brand-text-dark">
          <LightBulbIcon className="w-6 h-6 text-blue-500" />
          Suggested Ideal Answer
        </h3>
        <p className="text-brand-text-light italic">{feedback.idealAnswer}</p>
      </div>
    </div>
  );
};

export default FeedbackCard;