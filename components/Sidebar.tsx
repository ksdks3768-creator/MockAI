
import React from 'react';
import { AppState } from '../types';
import { LogoIcon, HomeIcon, ClockIcon, SendIcon, SettingsIcon } from './icons';

interface SidebarProps {
  currentState: AppState;
  onNavigate: (state: AppState) => void;
  isHidden?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentState, onNavigate, isHidden }) => {
  if (isHidden) return null;

  const navItems = [
    { state: AppState.DASHBOARD, icon: <HomeIcon className="w-6 h-6 md:w-5 md:h-5" />, label: 'Home' },
    { state: AppState.SETUP, icon: <SendIcon className="w-6 h-6 md:w-5 md:h-5" />, label: 'Practice' },
    { state: AppState.HISTORY, icon: <ClockIcon className="w-6 h-6 md:w-5 md:h-5" />, label: 'History' },
  ];

  const isNavActive = (state: AppState) => {
    if (state === AppState.DASHBOARD && currentState === AppState.DASHBOARD) return true;
    if (state === AppState.SETUP && (currentState === AppState.SETUP || currentState === AppState.GENERATING)) return true;
    if (state === AppState.HISTORY && currentState === AppState.HISTORY) return true;
    return false;
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0 bg-white border-r border-gray-200 flex-col z-20 transition-all">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <LogoIcon className="w-8 h-8 text-brand-text-dark" />
            <span className="font-bold text-lg tracking-tight">Coach.AI</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.state}
              onClick={() => onNavigate(item.state)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                isNavActive(item.state)
                  ? 'bg-brand-accent-green text-white shadow-md'
                  : 'text-brand-text-light hover:bg-brand-accent-green-light hover:text-brand-accent-green'
              }`}
            >
              {item.icon}
              {item.label === 'Home' ? 'Dashboard' : item.label === 'Practice' ? 'New Interview' : item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-brand-text-light hover:bg-gray-50 transition-colors">
            <SettingsIcon className="w-5 h-5" />
            Settings
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center px-2 py-3 pb-[calc(12px+env(safe-area-inset-bottom))] z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
        {navItems.map((item) => {
          const active = isNavActive(item.state);
          return (
            <button
              key={item.state}
              onClick={() => onNavigate(item.state)}
              className={`flex flex-col items-center gap-1 flex-1 py-1 px-2 rounded-xl transition-all active:scale-95 ${
                active ? 'text-brand-accent-green' : 'text-brand-text-light'
              }`}
            >
              <div className={`${active ? 'bg-brand-accent-green-light' : ''} p-1.5 rounded-lg transition-colors`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};

export default Sidebar;