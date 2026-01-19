import React from 'react';
import { DotsHorizontalIcon } from './icons';

interface ProgressCardProps {
  score: number; // Score from 0 to 100
}

const Dot: React.FC<{ filled: boolean }> = ({ filled }) => (
  <div className={`w-3.5 h-3.5 rounded-full ${filled ? 'bg-brand-accent-green' : 'bg-gray-200/70'}`} />
);

const ProgressCard: React.FC<ProgressCardProps> = ({ score }) => {
  // Define the number of dots in each row, from top to bottom, to match the reference image's layout.
  const rows = [5, 8, 10, 11];
  const totalDots = rows.reduce((sum, count) => sum + count, 0); // Total is 34
  const filledCount = Math.round((score / 100) * totalDots);

  const renderDots = () => {
    let filledLeft = filledCount;
    // We reverse the rows array to start filling from the bottom row visually.
    const renderedRows = [...rows].reverse().map((dotCount, rowIndex) => {
      const rowDots = [];
      for (let i = 0; i < dotCount; i++) {
        const isFilled = filledLeft > 0;
        rowDots.push(<Dot key={`${rowIndex}-${i}`} filled={isFilled} />);
        if (isFilled) {
          filledLeft--;
        }
      }
      return <div key={rowIndex} className="flex gap-1.5">{rowDots}</div>;
    });
    // We then reverse the rendered rows to get the correct visual order in the flex container.
    return <div className="space-y-1.5 flex flex-col-reverse">{renderedRows}</div>;
  };

  return (
    <div className="w-full bg-brand-card p-6 rounded-3xl shadow-sm border border-gray-200/50">
      <div className="flex justify-between items-start">
        <h2 className="text-lg font-bold text-brand-text-dark">Your progress</h2>
        <button className="text-brand-text-light hover:text-brand-text-dark">
          <DotsHorizontalIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="flex items-end justify-between mt-2">
        <div>
          <span className="text-7xl font-bold tracking-tighter text-brand-text-dark">{Math.round(score)}</span>
          <span className="text-5xl font-bold tracking-tighter text-brand-text-dark ml-1">%</span>
        </div>
        <p className="text-sm text-brand-text-light text-right w-1/3 mb-2">
          Of the interview plan completed
        </p>
      </div>

      <div className="mt-4">
        {renderDots()}
      </div>
    </div>
  );
};

export default ProgressCard;